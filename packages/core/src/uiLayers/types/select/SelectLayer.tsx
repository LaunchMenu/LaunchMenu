import React from "react";
import {Field, IDataHook, Observer} from "model-react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {adjustBindings} from "../../../menus/items/adjustBindings";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {IField} from "../../../_types/IField";
import {IUILayerMenuData} from "../../_types/IUILayerMenuData";
import {InputLayer} from "../input/InputLayer";
import {IInputConfig} from "../input/_types/IInputConfig";
import {ISelectConfig} from "./_types/ISelectConfig";
import {v4 as uuid} from "uuid";
import {IInputError} from "../input/_types/IInputError";
import {IViewStackItem} from "../../_types/IViewStackItem";
import {MenuView} from "../../../components/menu/MenuView";
import {createStandardMenuKeyHandler} from "../../../menus/menu/interaction/keyHandler/createStandardMenuKeyHandler";
import {ISelectOption} from "./_types/ISelectOption";
import {ISelectOptionData} from "./_types/ISelectOptionData";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {onMenuChangeAction} from "../../../actions/types/onMenuChange/onMenuChangAction";
import {isActionBindingFor} from "../../../actions/utils/isActionBindingFor";
import {searchAction} from "../../../actions/types/search/searchAction";
import {menuItemIdentityAction} from "../../../actions/types/identity/menuItemIdentityAction";
import {identityAction} from "../../../actions/types/identity/identityAction";
import {IDisposableKeyEventListener} from "../../../textFields/interaction/_types/IDisposableKeyEventListener";

export function isSelectObject(option: ISelectOption<any>): option is object {
    return typeof option == "object" && "value" in option;
}
export function getSelectOptionValue<T>(option: ISelectOption<T>): T {
    return isSelectObject(option) ? option.value : option;
}

export class SelectLayer<T> extends InputLayer<T> {
    protected menuData = new Field(null as null | IUILayerMenuData);
    protected config: IInputConfig<T> & ISelectConfig<T>;

    protected menu: SearchMenu;
    protected options: ISelectOptionData<T>[] = [];
    protected customItem?: IMenuItem;

    /**
     * Creates a new select UI
     * @param field The data field to target
     * @param config The configuration for the UI
     */
    public constructor(field: IField<T>, config: ISelectConfig<T>) {
        super(field, {
            allowSubmitExitOnError: false,
            icon: "select",
            ...config,
        } as IInputConfig<T>);
    }

    /** @override */
    protected validateConfig() {
        if (
            typeof this.target.get() != "string" &&
            this.config.allowCustomInput &&
            (!this.config.serialize || !this.config.serialize)
        )
            throw Error(
                "Non-string fields with custom input require a serializer and deserializer to be configured"
            );
    }

    /** @override */
    public getMenuData(hook?: IDataHook): IUILayerMenuData[] {
        const menuData = this.menuData.get(hook);
        return super.getMenuData(hook, menuData ? [menuData] : []);
    }

    /** @override */
    protected initialize(context: IIOContext, close: () => void): () => void {
        const superClose = super.initialize(context, close);

        // Create the menu
        const menu = (this.menu = new SearchMenu(context as IIOContext, {
            ...this.config.categoryConfig,
            showAllOnEmptySearch: true,
        }));
        const {handler: menuHandler, destroy: destroyMenuHandler} = this.getMenuHandler(
            menu
        );
        const menuData: IUILayerMenuData = {
            ID: uuid(),
            menu,
            menuView: this.getMenuView(menu),
            menuHandler,
        };

        // Retrieve and store the options
        this.options = this.config.options.map(option => {
            const view = this.getOptionItem(option);
            return {
                ...(isSelectObject(option) ? option : {value: option, disabled: false}),
                view,
            };
        });
        const optionItems = this.options.map(option => option.view);

        // Create a custom item if enabled
        if (this.config.allowCustomInput)
            this.customItem = this.setupCustomView(
                this.config.customView ?? this.getCustomView()
            );

        // Add all items to the menu
        const items = this.customItem ? [...optionItems, this.customItem] : optionItems;
        this.menu.setSearch("");
        this.menu.setSearchItems(items);

        // Observe the selected item
        const cursorObserver = new Observer(h => this.menu.getCursor(h)).listen(() => {
            // If live update is enabled, update the value when the cursor changes
            if (this.config.liveUpdate) this.updateField();
            this.updateError();
            this.errorListeners.callListeners(); // Force update a new render
        });

        // Observe the input
        const fieldObserver = new Observer(h =>
            this.fieldData.get(h)?.field?.get(h)
        ).listen(search => {
            if (search !== undefined) this.menu.setSearch(search);
        });

        // Open the UI
        this.menuData.set(menuData);

        // Return a disposer
        return () => {
            superClose();
            this.menuData.set(null);
            destroyMenuHandler();
            cursorObserver.destroy();
            fieldObserver.destroy();
        };
    }

    /** @override*/
    protected getInitialTextValue(): string {
        return "";
    }

    // Menu IO
    /**
     * Retrieves the menu view given the menu
     * @param menu The menu to create a view for
     * @returns The created view
     */
    protected getMenuView(menu: SearchMenu): IViewStackItem {
        return <MenuView menu={menu} />;
    }

    /**
     * Retrieves the key handler for a menu
     * @param menu The menu to create the handler for
     * @returns The key listener
     */
    protected getMenuHandler(menu: SearchMenu): IDisposableKeyEventListener {
        return createStandardMenuKeyHandler(menu);
    }

    // Value selection handling
    /**
     * Retrieves the menu item for a given option
     * @param option The option
     * @returns The menu item for the given option
     */
    protected getOptionItem(option: ISelectOption<T>): IMenuItem {
        const {value, disabled = false} = isSelectObject(option)
            ? option
            : {value: option, disabled: false};
        const item = menuItemIdentityAction.copyItem(
            this.config.createOptionView(value, disabled),
            disabled
                ? []
                : [
                      executeAction.createBinding(({context}) => this.submit(context)),
                      // Select this item when added to menu
                      onMenuChangeAction.createBinding((menu, added) => {
                          const v = this.target.get();
                          if (
                              menu == this.menu &&
                              added &&
                              (this.config.equals?.(v, value) ?? v == value)
                          )
                              menu.setCursor(item);
                      }),
                  ]
        );

        return item;
    }

    /** @override */
    protected checkError(text?: string): IInputError | null {
        if (this.isCustomSelected()) return super.checkError(text);
        const option = this.getSelected();
        if (!option)
            return {
                message: "The selected item isn't valid",
                ranges: [],
            };
        return null;
    }

    /** @override */
    public getValue(hook?: IDataHook): T | IInputError {
        if (this.isCustomSelected(hook)) return super.getValue(hook);
        const option = this.getSelected();
        return option
            ? option.value
            : {
                  message: "The selected item isn't valid",
                  ranges: [],
              };
    }

    /**
     * Retrieves the currently selected value
     * @returns The selected value, if any
     */
    protected getSelected(): ISelectOptionData<T> | undefined {
        const cursor = this.menu.getCursor();
        if (!cursor) return undefined;
        const option = this.options.find(
            ({view}) =>
                identityAction.getIdentity(view) == identityAction.getIdentity(cursor)
        );
        return option;
    }

    // Custom value menu item handling
    /**
     * Retrieves the custom view together with the execute binding
     * @param customView The item to add the execute handler to
     * @returns The item with execute handler
     */
    protected setupCustomView(customView: IMenuItem): IMenuItem {
        return {
            view: customView.view,
            actionBindings: adjustBindings(customView.actionBindings, bindings => [
                ...bindings,
                executeAction.createBinding(({context}) => this.submit(context)),
            ]),
        };
    }

    /**
     * Retrieves the item to show for custom input selection
     * @param srcItem The item to turn into the view, or none to generate it
     * @returns The view
     */
    protected getCustomView(srcItem?: IMenuItem): IMenuItem {
        // TODO: create a menu item for custom, which shows the current text
        const item = srcItem ?? createStandardMenuItem({name: "Custom"});

        // Create a search binding that returns this item no matter what the query
        const id = uuid();
        const searchBinding = searchAction.createBinding({
            ID: id,
            search: async query => ({
                // Note it should be this.customItem, not item, since item doesn't contain all data yet
                item:
                    query.search != "" // To prevent duplicates since all items show  when search is empty
                        ? this.customItem && {
                              item: this.customItem,
                              ID: id,
                              priority: 0.1,
                          }
                        : undefined,
            }),
        });

        // Return the item together with the new search action binding
        return {
            view: item.view,
            actionBindings: adjustBindings(item.actionBindings, bindings => [
                ...bindings.filter(binding => !isActionBindingFor(searchAction, binding)),
                searchBinding,
            ]),
        };
    }

    /**
     * Retrieves whether custom is currently selected
     * @param hook The hook to subscribe to changes
     * @returns Whether custom input is selected
     */
    public isCustomSelected(hook?: IDataHook): boolean {
        const cursor = this.menu.getCursor(hook);
        if (!cursor || !this.customItem) return false;
        return (
            identityAction.getIdentity(cursor) ==
            identityAction.getIdentity(this.customItem)
        );
    }
}

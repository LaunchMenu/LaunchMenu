import React from "react";
import {InputField} from "../inputField/InputField";
import {IField} from "../../../_types/IField";
import {IIOContext} from "../../../context/_types/IIOContext";
import {ISelectFieldConfig} from "./_types/ISelectFieldConfig";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {IInputFieldError} from "../inputField/_types/IInputFieldError";
import {IDataHook} from "model-react";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {openUI} from "../../../context/openUI/openUI";
import {searchAction} from "../../../menus/actions/types/search/searchAction";
import {v4 as uuid} from "uuid";
import {ISelectOption} from "./_types/ISelectOption";
import {executeAction} from "../../../menus/actions/types/execute/executeAction";
import {Observer} from "../../../utils/modelReact/Observer";
import {onMenuChangeAction} from "../../../menus/actions/types/onMenuChange/onMenuChangeAction";
import {ISelectOptionData} from "./_types/ISelectOptionData";
import {ManualSourceHelper} from "../../../utils/modelReact/ManualSourceHelper";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {plaintextLexer} from "../../syntax/plaintextLexer";
import {MenuView} from "../../../components/menu/MenuView";
import {adaptBindings} from "../../../menus/items/adjustBindings";

export function isSelectObject(option: ISelectOption<any>): option is object {
    return typeof option == "object" && "value" in option;
}
export function getSelectOptionValue<T>(option: ISelectOption<T>): T {
    return isSelectObject(option) ? option.value : option;
}

/**
 * A text field that can be used to select one of multiple options, or even a custom input
 */
export class SelectField<T> extends InputField<T> {
    protected menu: SearchMenu;
    protected closeMenu?: () => void;
    protected menuCursorObserver?: Observer<IMenuItem | null>;

    protected customItem?: IMenuItem;
    protected options: ISelectOptionData<T>[];

    protected dConfig: ISelectFieldConfig<T>;
    protected onSelect: (value: T | null, changed: boolean) => void;

    /**
     * Creates a new select field
     * @param field The data field to target
     * @param context The context to open the content error and search menu in
     * @param config The configuration for the field
     * @param onSelect A callback for when an option is selected
     */
    public constructor(
        field: IField<T>,
        context: IIOContext,
        config: ISelectFieldConfig<T>,
        onSelect?: (value: T | null, changed: boolean) => void
    ) {
        super(field, context, config as any);
        this.onSelect = onSelect || (() => {});
        this.dConfig = config;
        if (config.allowCustomInput)
            this.customItem = this.setupCustomView(
                config.customView ?? this.getCustomView()
            );
        this.setupMenu();
    }

    /** The default view for a select field */
    public view = (
        <TextFieldView
            field={this}
            icon={"search"}
            highlighter={this.getHighlighterWithError(plaintextLexer)}
        />
    );

    /** @override */
    protected setInitialValue(): void {}

    // Life cycle
    /** @override */
    public addViewCount(): void {
        if (this.context && !this.closeMenu)
            this.closeMenu = openUI(this.context, {
                menu: this.menu,
                menuView: <MenuView menu={this.menu} />,
                searchable: false,
                closable: false,
            });
        super.addViewCount();
    }

    /** @override */
    public destroy(): void {
        super.destroy();
        this.menuCursorObserver?.destroy();
        this.closeMenu?.();
    }

    // Menu management
    /**
     * Sets up the menu
     */
    protected setupMenu(): void {
        // Create the menu
        this.menu = new SearchMenu(
            this.context as IIOContext,
            this.dConfig.categoryConfig
        );

        // Retrieve and store the options
        this.options = this.dConfig.options.map(option => ({
            ...(isSelectObject(option) ? option : {value: option, disabled: false}),
            view: this.getOptionItem(option),
        }));
        const optionItems = this.options.map(option => option.view);

        // Add all items to the menu
        const items = this.customItem ? [...optionItems, this.customItem] : optionItems;
        this.menu.setSearch("");
        this.menu.setSearchItems(items);

        this.menuCursorObserver = new Observer(h => this.menu.getCursor(h)).listen(() => {
            // If live update is enabled, update the value when the cursor changes
            if (this.config.liveUpdate) this.updateField();
            this.updateError();
            this.errorListeners.callListeners(); // Force update a new render
        });
    }

    /**
     * Retrieves the menu item for a given option
     * @param option The option
     * @returns The menu item for the given option
     */
    protected getOptionItem(option: ISelectOption<T>): IMenuItem {
        const {value, disabled = false} = isSelectObject(option)
            ? option
            : {value: option, disabled: false};
        const item = this.dConfig.createOptionView(value, disabled);
        const finalItem = {
            view: item.view,
            actionBindings: adaptBindings(item.actionBindings, bindings => [
                ...bindings,
                ...(disabled
                    ? []
                    : [
                          executeAction.createBinding({
                              execute: () => this.onSelect(value, true),
                          }),
                          // Select this item when added to menu
                          onMenuChangeAction.createBinding({
                              onMenuChange: (menu, added) => {
                                  const v = this.target.get(null);
                                  if (
                                      menu == this.menu &&
                                      added &&
                                      (this.dConfig.equals?.(v, value) ?? v == value)
                                  )
                                      menu.setCursor(finalItem);
                              },
                          }),
                      ]),
            ]),
        };
        return finalItem;
    }

    /** @override */
    public set(value: string): void {
        this.menu.setSearch(value);
        super.set(value);
    }

    // Handling live updates
    /** @override */
    public updateField(): boolean {
        if (this.isCustomSelected()) return super.updateField();
        else {
            const cursor = this.menu.getCursor();
            const option = this.options.find(({view}) => view == cursor);
            if (option) this.target.set(option.value);
            return true;
        }
    }

    // Error handling
    /** @override */
    protected checkError(text?: string): IInputFieldError | null {
        return this.isCustomSelected() ? super.checkError(text) : null;
    }

    // Custom menu item handling
    /**
     * Retrieves the custom view together with the execute binding
     * @param customView The item to add the execute handler to
     * @returns The item with execute handler
     */
    protected setupCustomView(customView: IMenuItem): IMenuItem {
        return {
            view: customView.view,
            actionBindings: adaptBindings(customView.actionBindings, bindings => [
                ...bindings,
                executeAction.createBinding({
                    execute: () => {
                        const value = this.get();
                        const error = this.checkError(value);
                        if (error) this.onSelect(null, false);
                        else
                            this.onSelect(
                                this.dConfig.deserialize?.(value) ?? (value as any),
                                true
                            );
                    },
                }),
            ]),
        };
    }

    /**
     * Retrieves the item to show for custom input selection
     * @param srcItem The item to turn into the view, or none to generate it
     * @returns The view
     */
    protected getCustomView(srcItem?: IMenuItem): IMenuItem {
        // TODO: create an menu item for custom, which shows the current text
        const item = srcItem ?? createStandardMenuItem({name: "Custom"});

        // Create a search binding that returns this item no matter what the query
        const id = uuid();
        const searchBinding = searchAction.createBinding({
            search: async (query, cb) => {
                if (this.customItem)
                    cb({
                        item: this.customItem,
                        id,
                        priority: 0.1,
                        getUpdatedPriority: async () => 0.1,
                    });
            },
        });

        // Return the item together with the new search action binding
        return {
            view: item.view,
            actionBindings: adaptBindings(item.actionBindings, bindings => [
                ...bindings.filter(
                    ({action}) =>
                        !(action == searchAction || action.ancestors[0] == searchAction)
                ),
                searchBinding,
            ]),
        };
    }

    /**
     * Retrieves whether custom is currently selected
     * @param hook The hook to subscribe to changes
     * @returns Whether custom input is selected
     */
    public isCustomSelected(hook: IDataHook = null): boolean {
        return this.menu.getCursor(hook) == this.customItem;
    }
}

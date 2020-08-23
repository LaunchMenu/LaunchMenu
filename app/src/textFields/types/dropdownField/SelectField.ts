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

/**
 * A text field that can be used to select one of multiple options, or even a custom input
 */
export class SelectField<T> extends InputField<T> {
    protected menu: SearchMenu;
    protected closeMenu?: () => void;
    protected menuCursorObserver?: Observer<IMenuItem | null>;

    protected customItem?: IMenuItem;
    protected options: ISelectOption<T>[];

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

    /** @override */
    protected setInitialValue(): void {}

    // Life cycle
    /** @override */
    public init(): void {
        if (this.context)
            this.closeMenu = openUI(this.context, {menu: this.menu, searchable: false});
    }

    /** @override */
    public destroy(): void {
        this.menuCursorObserver?.destroy();
        this.closeMenu?.();
        super.destroy();
    }

    // Menu management
    /**
     * Sets up the menu
     */
    protected setupMenu(): void {
        // Create the menu
        this.menu = new SearchMenu(this.dConfig.categoryConfig);

        // Retrieve and store the options
        this.options = this.dConfig.options.map(option => ({
            ...option,
            view: this.getOptionItem(option),
        }));
        const optionItems = this.options.map(option => option.view);

        // Add all items to the menu
        const items = this.customItem ? [...optionItems, this.customItem] : optionItems;
        this.menu.setSearch("");
        this.menu.setSearchItems(items);

        // If live update is enabled, update the value when the cursor changes
        if (this.config.liveUpdate)
            this.menuCursorObserver = new Observer(h => this.menu.getCursor(h)).listen(
                () => {
                    this.updateField();
                    this.updateError();
                    this.callListeners(); // Force update a new render
                }
            );
    }

    /**
     * Retrieves the menu item for a given option
     * @param option The option
     * @returns The menu item for the given option
     */
    protected getOptionItem(option: ISelectOption<T>): IMenuItem {
        const item = option.view;
        return {
            view: item.view,
            actionBindings: [
                ...item.actionBindings,
                ...(option.disabled
                    ? []
                    : [
                          executeAction.createBinding({
                              execute: () => this.onSelect(option.value, true),
                          }),
                      ]),
            ],
        };
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
            actionBindings: [
                ...customView.actionBindings,
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
            ],
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

        // Retrieve all action bindings except for the search bindings
        const withoutSearch = item.actionBindings.filter(
            ({action}) => !(action == searchAction || action.ancestors[0] == searchAction)
        );

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
        return {view: item.view, actionBindings: [...withoutSearch, searchBinding]};
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

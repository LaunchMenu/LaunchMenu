import React, {ReactNode} from "react";
import {Field, IDataHook} from "model-react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {IField} from "../../../_types/IField";
import {IUILayerMenuData} from "../../_types/IUILayerMenuData";
import {ISelectOptionData} from "../select/_types/ISelectOptionData";
import {IMultiSelectConfig} from "./_types/IMultiSelectConfig";
import {v4 as uuid} from "uuid";
import {IInputError} from "../input/_types/IInputError";
import {adjustBindings} from "../../../menus/items/adjustBindings";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {IViewStackItem} from "../../_types/IViewStackItem";
import {MenuView} from "../../../components/menu/MenuView";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {createMenuKeyHandler} from "../../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {IUILayerFieldData} from "../../_types/IUILayerFieldData";
import {IUILayerContentData} from "../../_types/IUILayerContentData";
import {AbstractUILayer} from "../../AbstractUILayer";
import {ManualSourceHelper} from "../../../utils/modelReact/ManualSourceHelper";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {ITextField} from "../../../textFields/_types/ITextField";
import {createTextFieldKeyHandler} from "../../../textFields/interaction/keyHandler/createTextFieldKeyHandler";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {plaintextLexer} from "../../../textFields/syntax/plaintextLexer";
import {IHighlighter} from "../../../textFields/syntax/_types/IHighlighter";
import {createContentError} from "../../../components/content/error/createContentError";
import {TextField} from "../../../textFields/TextField";
import {waitFor} from "../../../utils/modelReact/waitFor";
import {createFinishMenuItem} from "../../../menus/items/createFinishMenuItem";
import {Observer} from "../../../utils/modelReact/Observer";
import {IMultiSelectOption} from "./_types/IMultiSelectOption";
import {IMultiSelectOptionData} from "./_types/IMultiSelectOptionData";
import {getControlsCategory} from "../../../menus/categories/types/getControlsCategory";
import {getCategoryAction} from "../../../actions/types/category/getCategoryAction";
import {searchAction} from "../../../actions/types/search/searchAction";
import {isActionBindingFor} from "../../../actions/utils/isActionBindingFor";
import {onMenuChangeAction} from "../../../actions/types/onMenuChange/onMenuChangAction";
import {menuItemIdentityAction} from "../../../actions/types/identity/menuItemIdentityAction";
import {identityAction} from "../../../actions/types/identity/identityAction";

export function isMultiSelectObject(option: IMultiSelectOption<any>): option is object {
    return typeof option == "object" && "value" in option;
}
export function getMultiSelectOptionValue<T>(option: IMultiSelectOption<T>): T {
    return isMultiSelectObject(option) ? option.value : option;
}

/**
 * A UILayer that can be used as an input to chose multiple elements from a selection of items
 */
export class MultiSelect<T> extends AbstractUILayer {
    protected target: IField<T[]>;
    protected config: IMultiSelectConfig<T>;

    protected fieldData = new Field(null as null | IUILayerFieldData);
    protected contentData = new Field(null as null | IUILayerContentData);
    protected menuData = new Field(null as null | IUILayerMenuData);
    protected textField: TextField;
    protected menu: SearchMenu;

    protected error = new Field(null as null | IInputError);
    protected errorListeners = new ManualSourceHelper();

    protected selection: IField<T[]>;

    protected options: ISelectOptionData<T>[] = [];
    protected customOptions: IMultiSelectOptionData<T>[] = [];
    protected customItem?: IMenuItem;

    protected equals: (a: T, b: T) => boolean;

    /**
     * Creates a new select UI
     * @param field The data field to target
     * @param config The configuration for the UI
     */
    public constructor(field: IField<T[]>, config: IMultiSelectConfig<T>) {
        super();
        this.target = field;
        this.config = config ?? ({liveUpdate: true} as any);
        this.equals = config.equals ?? ((a, b) => a == b);
        this.validateConfig();
    }

    /** @override */
    protected validateConfig() {
        if (
            typeof this.target.get(null) != "string" &&
            this.config.allowCustomInput &&
            (!this.config.serialize || !this.config.serialize)
        )
            throw Error(
                "Non-string fields with custom input require a serializer and deserializer to be configured"
            );
    }

    /** @override */
    public getFieldData(hook: IDataHook = null): IUILayerFieldData[] {
        const fieldData = this.fieldData.get(hook);
        return super.getFieldData(hook, fieldData ? [fieldData] : []);
    }

    /** @override */
    public getContentData(hook: IDataHook = null): IUILayerContentData[] {
        const contentData = this.contentData.get(hook);
        return super.getContentData(hook, contentData ? [contentData] : []);
    }

    /** @override */
    public getMenuData(hook: IDataHook = null): IUILayerMenuData[] {
        const menuData = this.menuData.get(hook);
        return super.getMenuData(hook, menuData ? [menuData] : []);
    }

    /** @override */
    protected initialize(context: IIOContext, close: () => void): () => void {
        if (this.fieldData.get(null))
            throw Error("An input can only be opened in 1 context");

        // Setup the selection field
        if (this.config.liveUpdate) this.selection = this.target;
        else this.selection = new Field(this.target.get(null));

        // Create the data models
        const menu = (this.menu = new SearchMenu(context, {
            ...this.config.categoryConfig,
            showAllOnEmptySearch: true,
        }));
        const value = this.getInitialTextValue();
        const field = (this.textField = new TextField(value, {
            start: value.length,
            end: value.length,
        }));

        // Obtain all menu and field data
        const menuData: IUILayerMenuData = {
            ID: uuid(),
            menu,
            menuView: this.getMenuView(menu),
            menuHandler: this.getMenuHandler(menu),
        };
        const fieldData: IUILayerFieldData = {
            ID: uuid(),
            field,
            fieldView: this.getFieldView(field),
            fieldHandler: this.getFieldHandler(field, context, close),
        };

        // Retrieve and store the options
        this.options = this.config.options.map(option => ({
            ...(isMultiSelectObject(option) ? option : {value: option, disabled: false}),
            view: this.getOptionItem(option),
        }));
        const optionItems = this.options.map(option => option.view);

        // Create a custom item if enabled
        if (this.config.allowCustomInput) this.setupCustomView();

        // Add all items to the menu
        const items = [
            this.getFinishView(),
            ...(this.customItem ? [this.customItem, ...optionItems] : optionItems),
        ];
        // console.log("detect");
        this.menu.setSearch("");
        this.menu.setSearchItems(items);
        this.addCustomSelectedOptions();

        // Observe the selected item
        const cursorObserver = new Observer(h => this.menu.getCursor(h)).listen(() => {
            this.updateError();
            this.errorListeners.callListeners(); // Force update a new render
        });

        // Observe the input
        const fieldObserver = new Observer(h => field?.get(h)).listen(search => {
            if (search !== undefined) this.menu.setSearch(search);
            this.updateError();
        });

        // Open the UI
        this.menuData.set(menuData);
        this.fieldData.set(fieldData);

        // Return a disposer
        return () => {
            this.menuData.set(null);
            this.fieldData.set(null);
            this.contentData.set(null);
            cursorObserver.destroy();
            fieldObserver.destroy();
        };
    }

    // IO
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
    protected getMenuHandler(menu: SearchMenu): IKeyEventListener {
        return createMenuKeyHandler(menu);
    }

    /**
     * Retrieves the initial textual value of the field
     * @returns The initial text field value
     */
    protected getInitialTextValue(): string {
        return "";
    }

    /**
     * Retrieves the field view given a field
     * @param field The field to create a view for
     * @returns The created view
     */
    protected getFieldView(field: ITextField): IViewStackItem {
        return (
            <TextFieldView
                field={field}
                icon={this.config.icon}
                highlighter={this.getHighlighterWithError(this.config.highlighter)}
            />
        );
    }

    /**
     * Retrieves the key handler for a field
     * @param field The field to create the handler for
     * @param context The context to be used for the key settings
     * @param close The function that can be used to close this layer
     * @returns The key listener
     */
    protected getFieldHandler(
        field: ITextField,
        context: IIOContext,
        close: () => void
    ): IKeyEventListener {
        return createTextFieldKeyHandler(field, context, () => {
            if (this.textField.get(null) != "") this.textField.set("");
            else close();
        });
    }

    // menu item handling
    /**
     * Retrieves a menu item for a given option
     * @param option The option to retrieve the menu item for
     * @returns The menu item
     */
    protected getOptionItem(option: IMultiSelectOption<T>): IMenuItem {
        const {value, disabled = false} = isMultiSelectObject(option)
            ? option
            : {value: option, disabled: false};
        const includes = (hook?: IDataHook) =>
            !!this.getValue(hook ?? null).find(v => this.equals(v, value));

        const item = menuItemIdentityAction.copyItem(
            this.config.createOptionView(value, includes, disabled),
            disabled
                ? []
                : [
                      executeAction.createBinding({
                          execute: () => {
                              const cur = this.getValue(null);
                              if (includes()) {
                                  this.selection.set(
                                      cur.filter(v => !this.equals(v, value))
                                  );
                              } else this.selection.set([...cur, value]);
                          },
                      }),
                  ]
        );

        return item;
    }

    /**
     * Adds the custom options that are currently selected in the field to the menu
     */
    protected addCustomSelectedOptions(): void {
        const selection = this.selection.get(null);
        selection.forEach(value => {
            if (
                !this.config.options.find(option =>
                    this.equals(getMultiSelectOptionValue(option), value)
                )
            ) {
                this.addCustomOption(
                    this.config.serialize?.(value) ?? (value as any),
                    false
                );
            }
        });
    }

    /**
     * Retrieves the menu item used to finish editing
     * @returns The created menu item
     */
    protected getFinishView(): IMenuItem {
        return createFinishMenuItem({
            onExecute: ({context}) => this.submit(context),
            actionBindings: [getCategoryAction.createBinding(getControlsCategory())],
        });
    }

    // Error handling
    /**
     * Retrieves the input error if any
     * @param hook The hook to subscribe to changes
     * @returns The error with the current input if any
     */
    public getError(hook: IDataHook = null): IInputError | null {
        return this.error.get(hook);
    }

    /**
     * Retrieves the error message for the current input if any
     * @param text The text to retrieve the error for
     * @returns The error
     */
    protected checkError(text?: string): IInputError | null {
        const inpText = text ?? this.getText(null);
        return (inpText && this.config.checkValidity?.(inpText)) || null;
    }

    /**
     * Updates the error and shows the UI
     * @returns The new error if any
     */
    protected updateError(): IInputError | null {
        const error = this.checkError();
        this.error.set(error);

        const context = this.context.get(null);
        if (error && context) {
            let errorView: ReactNode;
            if ("view" in error) errorView = error.view;
            else errorView = error.message;
            this.contentData.set(createContentError(errorView, context));
        } else {
            this.contentData.set(null);
        }

        return error;
    }

    /**
     * Augments a given highlighter with the input error range
     * @param highlighter The highlighter to extend, or the plain text highlighter if left out
     * @returns The augmented highlighter
     */
    protected getHighlighterWithError(
        highlighter: IHighlighter = plaintextLexer
    ): IHighlighter {
        return {
            highlight: (syntax, h) => {
                const {nodes, errors} = highlighter.highlight(syntax);
                const fieldError = this.checkError(syntax);
                this.errorListeners.addListener(h); // Such that we can force updates, even if the text hasn't changed
                return {
                    nodes,
                    errors: fieldError?.ranges
                        ? [
                              ...errors,
                              ...fieldError.ranges.map(({start, end}) => ({
                                  syntaxRange: {
                                      start,
                                      end,
                                      text: syntax.substring(start, end),
                                  },
                                  message:
                                      "message" in fieldError ? fieldError.message : "",
                                  type: "validity",
                              })),
                          ]
                        : errors,
                };
            },
        };
    }

    // Value selection handling
    /**
     * Retrieves the text input of the field
     * @param hook THe data hook to subscribe to changes
     * @returns The text input
     */
    protected getText(hook: IDataHook = null): string | undefined {
        return this.fieldData.get(hook)?.field?.get(hook) ?? undefined;
    }

    /**
     * Retrieves the current value
     * @param hook The hook to subscribe to changes
     * @returns The current selection
     */
    public getValue(hook: IDataHook = null): T[] {
        return this.selection.get(hook);
    }

    /**
     * Commits the current text value to the target field
     */
    public updateField() {
        // Update the value
        let value = this.getValue();
        this.target.set(value);
    }

    /**
     * Submits the current value
     * @param context The context to execute the command with (if specified in config)
     */
    protected submit(context: IIOContext): void {
        // Check whether exiting is allowed
        if (this.config?.allowSubmitExitOnError == false && this.checkError()) return;

        // Set the new value
        const value = this.getValue();
        if (this.config.onSubmit) this.config.onSubmit(value);
        else if (this.config.undoable)
            context.undoRedo.execute(new SetFieldCommand(this.target, value));
        else this.target.set(value);

        // Close the UI
        this.closeAll();
    }

    // Custom option handling
    /**
     * Adds a custom option based on the given or currently typed value
     * @param text The text to convert into a custom value (if valid)
     * @param add Whether to add the value to the current data field
     * @returns The menu item that was added or selected
     */
    protected addCustomOption(
        rawValue: string = this.getText() ?? "",
        add: boolean = true
    ): IMenuItem | null {
        const error = this.checkError(rawValue);
        if (!error) {
            const value = this.config.deserialize?.(rawValue) ?? ((rawValue as any) as T);
            // Check if the value doesn't exist already
            const matchingOption = [
                ...this.options,
                ...this.customOptions,
            ].find(({value: v}) => this.equals(value, v));
            const selection = this.getValue();
            if (matchingOption) {
                // If it does exist, make sure it's selected
                if (add && !selection.find(v => this.equals(v, value)))
                    this.selection.set([...selection, value]);
                return matchingOption.view;
            } else {
                // If it doesn't exist create and add it
                const rawItem = this.config.createOptionView(value, () => true, false);
                let selectItem = add;
                const item = {
                    view: rawItem.view,
                    actionBindings: adjustBindings(rawItem.actionBindings, bindings => [
                        ...bindings,
                        executeAction.createBinding({
                            execute: () => void this.removeCustomOption(value),
                        }),
                        ...(selectItem
                            ? [
                                  onMenuChangeAction.createBinding((menu, added) => {
                                      if (selectItem && added && menu == this.menu) {
                                          menu.setCursor(item);
                                          selectItem = false;
                                      }
                                  }),
                              ]
                            : []),
                    ]),
                };

                this.menu.addSearchItem(item);
                this.customOptions.push({view: item, value});
                if (add) this.selection.set([...selection, value]);
                return item;
            }
        }
        return null;
    }

    /**
     * Removes the specified option from the list if it was a custom option
     * @param value The value of the option to remove
     * @returns Whether the item was successfully removed
     */
    protected removeCustomOption(value: T): boolean {
        const index = this.customOptions.findIndex(({value: v}) => this.equals(v, value));
        if (index != -1) {
            this.menu.removeSearchItem(this.customOptions[index].view);

            this.customOptions.splice(index, 1);
            this.selection.set(this.selection.get(null).filter(v => v != value));
            return true;
        }
        return false;
    }

    // Custom value menu item handling
    /**
     * Sets up the custom view item
     */
    protected setupCustomView(): void {
        if (this.config.createCustomView) {
            const customInput = (hook?: IDataHook) =>
                this.isCustomSelected(hook) ? this.getText(hook) ?? null : null;
            this.customItem = this.getBoundCustomView(
                this.config.createCustomView(customInput)
            );
        } else {
            this.customItem = this.getBoundCustomView(this.getSearchableCustomView());
        }
    }

    /**
     * Retrieves the custom view with all correct action bindings
     * @param customView The item to add the execute handler to
     * @returns The item with execute handler
     */
    protected getBoundCustomView(customView: IMenuItem): IMenuItem {
        return {
            view: customView.view,
            actionBindings: adjustBindings(customView.actionBindings, bindings => [
                ...bindings,
                executeAction.createBinding({
                    execute: () => {
                        const item = this.addCustomOption();
                        if (item) {
                            this.textField.set("");
                            waitFor(h => this.menu.getItems(h).includes(item)).then(() =>
                                this.menu.setCursor(item)
                            );
                        }
                    },
                }),
            ]),
        };
    }

    /**
     * Retrieves the item to show for custom input selection with proper search binding
     * @param srcItem The item to turn into the view, or none to generate it
     * @returns The view
     */
    protected getSearchableCustomView(srcItem?: IMenuItem): IMenuItem {
        // TODO: create an menu item for custom, which shows the current text
        const item = srcItem ?? createStandardMenuItem({name: "Add custom"});

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
                ...bindings.filter(
                    binding => !isActionBindingFor(searchAction, [binding])
                ),
                searchBinding,
                getCategoryAction.createBinding(getControlsCategory()),
            ]),
        };
    }

    /**
     * Retrieves whether custom is currently selected
     * @param hook The hook to subscribe to changes
     * @returns Whether custom input is selected
     */
    public isCustomSelected(hook: IDataHook = null): boolean {
        const cursor = this.menu.getCursor(hook);
        if (!cursor || !this.customItem) return false;
        return (
            identityAction.getIdentity(cursor) ==
            identityAction.getIdentity(this.customItem)
        );
    }
}

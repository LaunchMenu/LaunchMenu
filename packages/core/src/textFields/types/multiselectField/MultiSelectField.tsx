import React from "react";
import {IField} from "../../../_types/IField";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IDataHook, Field} from "model-react";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {executeAction} from "../../../menus/actions/types/execute/executeAction";
import {TextField} from "../../TextField";
import {IMultiSelectFieldConfig} from "./_types/IMultiselectFieldConfig";
import {IMultiSelectOption} from "./_types/IMultiSelectOption";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {Observer} from "../../../utils/modelReact/Observer";
import {searchAction} from "../../../menus/actions/types/search/searchAction";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {v4 as uuid} from "uuid";
import {plaintextLexer} from "../../syntax/plaintextLexer";
import {IHighlighter} from "../../syntax/_types/IHighlighter";
import {IInputFieldError} from "../inputField/_types/IInputFieldError";
import {openUI} from "../../../context/openUI/openUI";
import {createFinishMenuItem} from "../../../menus/items/createFinishMenuItem";
import {getCategoryAction} from "../../../menus/actions/types/category/getCategoryAction";
import {controlsCategory} from "../../../menus/categories/types/controlsCategory";
import {onMenuChangeAction} from "../../../menus/actions/types/onMenuChange/onMenuChangeAction";
import {IMultiSelectOptionData} from "./_types/IMultiSelectOptionData";
import {ManualSourceHelper} from "../../../utils/modelReact/ManualSourceHelper";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {createContentError} from "../../../components/content/error/createContentError";
import {MenuView} from "../../../components/menu/MenuView";
import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {adjustBindings} from "../../../menus/items/adjustBindings";
import {getHooked} from "../../../utils/subscribables/getHooked";

function isMultiSelectObject(option: IMultiSelectOption<any>): option is object {
    return typeof option == "object" && "value" in option;
}
function getMultiSelectOptionValue<T>(option: IMultiSelectOption<T>): T {
    return isMultiSelectObject(option) ? option.value : option;
}

/**
 * A class that can be used to handle multiple item selections
 */
export class MultiSelectField<T> extends TextField {
    protected field: IField<T[]>;

    protected error = new Field(null as null | IInputFieldError);
    protected closeError?: () => void;
    protected errorListeners = new ManualSourceHelper();

    protected menu: SearchMenu;
    protected closeMenu?: () => void;
    protected menuCursorObserver: Observer<IMenuItem | null>;
    protected menuItemsObserver: Observer<IMenuItem[]>;

    protected customItem?: IMenuItem;
    protected finishItem?: IMenuItem;
    protected options: IMultiSelectOptionData<T>[];
    protected customOptions: IMultiSelectOptionData<T>[] = [];

    protected context: IIOContext;
    protected config: IMultiSelectFieldConfig<T>;
    protected equals: (a: T, b: T) => boolean;
    protected onSelect: (value: T[] | null) => void;

    /**
     * Creates a new multi select field
     * @param field The data field to target
     * @param context The context to open the content error and search menu in
     * @param config The configuration for the field
     * @param onSelect A callback for when an option is selected
     */
    public constructor(
        field: IField<T[]>,
        context: IIOContext,
        config: IMultiSelectFieldConfig<T>,
        onSelect?: (value: T[] | null) => void
    ) {
        super();
        this.config = config;
        this.equals = config.equals ?? ((a, b) => a == b);
        this.context = context;
        this.onSelect = onSelect || (() => {});

        if (this.config.liveUpdate) this.field = field;
        else this.field = new Field(field.get(null));

        if (config.allowCustomInput) this.setupCustomView();

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
        this.closeError?.();
        this.closeMenu?.();
        this.menuCursorObserver.destroy();
        this.menuItemsObserver.destroy();
    }

    // Menu management
    /**
     * Sets up the menu
     */
    protected setupMenu(): void {
        // Create the menu
        this.menu = new SearchMenu(this.context, {
            ...this.config.categoryConfig,
            showAllOnEmptySearch: true,
        });

        // Retrieve and store the options
        this.options = this.config.options.map(option => ({
            ...(isMultiSelectObject(option) ? option : {value: option, disabled: false}),
            view: this.getOptionItem(option),
        }));
        const optionItems = this.options.map(option => option.view);

        // Add all items to the menu
        const items = [
            this.getFinishView(),
            ...(this.customItem ? [this.customItem, ...optionItems] : optionItems),
        ];
        this.menu.setSearch("");
        this.menu.setSearchItems(items);
        this.addCustomSelectedOptions();

        // Update the cursor when items are added
        this.menuItemsObserver = new Observer(h => this.menu.getItems(h)).listen(
            items => {
                if (this.isCustomSelected() && items.length > 0)
                    this.menu.setCursor(items[0]);
            }
        );

        // Update the error message and highlighter on cursor change
        this.menuCursorObserver = new Observer(h => this.menu.getCursor(h)).listen(() => {
            this.updateError();
            this.errorListeners.callListeners(); // Force update a new render
        });
    }

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
            !!this.field.get(hook ?? null).find(v => this.equals(v, value));

        const item = this.config.createOptionView(value, includes, disabled);
        const finalItem = {
            view: item.view,
            actionBindings: adjustBindings(item.actionBindings, bindings => [
                ...bindings,
                ...(disabled
                    ? []
                    : [
                          executeAction.createBinding({
                              execute: () => {
                                  const cur = this.field.get(null);
                                  if (includes()) {
                                      this.field.set(
                                          cur.filter(v => !this.equals(v, value))
                                      );
                                      this.removeCustomOption(value);
                                  } else this.field.set([...cur, value]);
                              },
                          }),
                      ]),
            ]),
        };
        return finalItem;
    }

    /**
     * Adds the custom options that are currently selected in the field to the menu
     */
    protected addCustomSelectedOptions(): void {
        const selection = this.field.get(null);
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
            onExecute: () => this.onSelect(this.field.get(null)),
            actionBindings: [getCategoryAction.createBinding(controlsCategory)],
        });
    }

    // Custom option handling
    /**
     * Adds a custom option based on the given or currently typed value
     * @param text The text to convert into a custom value (if valid)
     * @param add Whether to add the value to the current data field
     * @returns The menu item that was added or selected
     */
    protected addCustomOption(
        rawValue: string = this.get(),
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
            const selection = this.field.get(null);
            if (matchingOption) {
                // If it does exist, make sure it's selected
                if (add && !selection.find(v => this.equals(v, value)))
                    this.field.set([...selection, value]);
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
                                  onMenuChangeAction.createBinding({
                                      onMenuChange: (menu, added) => {
                                          if (selectItem && added && menu == this.menu) {
                                              menu.setCursor(item);
                                              selectItem = false;
                                          }
                                      },
                                  }),
                              ]
                            : []),
                    ]),
                };

                this.menu.addSearchItem(item);
                this.customOptions.push({view: item, value});
                if (add) this.field.set([...selection, value]);
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
            this.field.set(this.field.get(null).filter(v => v != value));
            return true;
        }
        return false;
    }

    // Custom menu item handling
    /**
     * Sets up the custom view item
     */
    protected setupCustomView(): void {
        if (this.config.createCustomView) {
            const customInput = (hook?: IDataHook) =>
                this.isCustomSelected(hook) ? this.get(hook) : null;
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
        const n = {
            view: customView.view,
            actionBindings: adjustBindings(customView.actionBindings, bindings => [
                ...bindings,
                executeAction.createBinding({
                    execute: () => {
                        const item = this.addCustomOption();
                        if (item)
                            // Don't update the error immediately, and select the added item
                            this.set("", false).then(() => this.menu.setCursor(item));
                    },
                }),
            ]),
        };
        return n;
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
        const searchBinding = searchAction.createBinding([
            {
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
            },
        ]);

        // Return the item together with the new search action binding
        return {
            view: item.view,
            actionBindings: adjustBindings(item.actionBindings, bindings => [
                ...bindings.filter(binding => !searchAction.canBeAppliedTo([binding])),
                searchBinding,
                getCategoryAction.createBinding(controlsCategory),
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

    // Error handling
    /**
     * Sets the new value of the input
     * @param value The value to set
     * @param updateError Whether the error message should be updated
     */
    public set(value: string, updateError: boolean = true): Promise<void> {
        let promise = this.menu.setSearch(value);
        super.set(value);
        if (updateError) this.updateError();
        return promise;
    }

    /**
     * Retrieves the error message for the current input if any
     * @param text The text to retrieve the error for
     * @returns The error
     */
    protected checkError(text?: string): IInputFieldError | null {
        if (!this.isCustomSelected()) return null;
        return this.config.checkValidity?.(text ?? this.get()) || null;
    }

    /**
     * Updates the error and shows the UI
     * @returns The new error if any
     */
    protected updateError(): IInputFieldError | null {
        const error = this.checkError();
        this.error.set(error);

        this.closeError?.();
        if (error && this.context) {
            let errorView: IViewStackItem;
            if ("view" in error) errorView = error.view;
            else errorView = createContentError(error.message);

            this.closeError = openUI(this.context, {content: errorView});
        }
        return error;
    }

    // Utils
    /**
     * Augments a given highlighter with the input error range
     * @param highlighter The highlighter to extend, or the plain text highlighter if left out
     * @returns The augmented highlighter
     */
    public getHighlighterWithError(
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
}

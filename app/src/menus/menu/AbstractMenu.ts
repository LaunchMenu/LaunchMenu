import {AbstractUIModel} from "../../context/AbstractUIModel";
import {IIOContext} from "../../context/_types/IIOContext";
import {IMenu} from "./_types/IMenu";
import {Field, IDataHook} from "model-react";
import {IMenuItem} from "../items/_types/IMenuItem";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {isItemSelectable} from "../items/isItemSelectable";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";

/**
 * An abstract menu class that doesn't deal with item management itself
 */
export abstract class AbstractMenu extends AbstractUIModel implements IMenu {
    protected context: IIOContext;
    protected destroyed = new Field(false);
    protected cursor = new Field(null as IMenuItem | null);
    protected selected = new Field([] as IMenuItem[]);

    /**
     * Creates a new abstract menu
     * @param context The context that menu items can use
     */
    public constructor(context: IIOContext) {
        super();
        this.context = context;
    }

    /**
     * Retrieves the IOContext that's associated with this menu
     * @returns The context
     */
    public getContext(): IIOContext {
        return this.context;
    }

    // Item management
    /**
     * Retrieves all items in the menu
     * @param hook The hook to subscribe to changes
     * @returns All items including category items in the correct sequence
     */
    public abstract getItems(hook?: IDataHook): IMenuItem[];

    /**
     * Retrieves all categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns All categories and the items that belong to those categories, in the correct sequence
     */
    public abstract getCategories(hook?: IDataHook): IMenuCategoryData[];

    // Selection management

    /**
     * Selects or deselects the given item
     * @param item The item to select or deselect
     * @param selected Whether to select or deselect
     */
    public setSelected(item: IMenuItem, selected: boolean = true): void {
        if (this.getItems().includes(item) && !this.destroyed.get(null)) {
            const selectedItems = this.selected.get(null);
            if (selected) {
                if (!selectedItems.includes(item) && isItemSelectable(item)) {
                    this.selected.set([...selectedItems, item]);
                    onSelectAction.get([item]).onSelect(true, this);
                }
            } else {
                if (selectedItems.includes(item)) {
                    this.selected.set(selectedItems.filter(i => i != item));
                    onSelectAction.get([item]).onSelect(false, this);
                }
            }
        }
    }

    /**
     * Selects an item to be the cursor
     * @param item The new cursor
     */
    public setCursor(item: IMenuItem | null): void {
        if (
            (!item || (this.getItems().includes(item) && isItemSelectable(item))) &&
            !this.destroyed.get(null)
        ) {
            const currentCursor = this.cursor.get(null);
            if (currentCursor) onCursorAction.get([currentCursor]).onCursor(false, this);

            this.cursor.set(item);

            if (item) onCursorAction.get([item]).onCursor(true, this);
        }
    }

    /**
     * Retrieves the currently selected items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The selected menu items
     */
    public getSelected(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        return this.selected.get(hook);
    }

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    public getCursor(hook: IDataHook = null): IMenuItem | null {
        if (this.isDestroyed(hook)) return null;
        return this.cursor.get(hook);
    }

    /**
     * Retrieves all the selected items including the cursor
     * @param hook The hook to subscribe to changes
     * @returns The selected items including the cursor
     */
    public getAllSelected(hook: IDataHook = null): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        const cursor = this.cursor.get(hook);
        const selected = this.getSelected(hook);
        if (cursor && !selected.includes(cursor)) return [...selected, cursor];
        return selected;
    }

    // Destroy management
    /**
     * Destroys the menu, making sure that all items are unselected
     */
    public destroy(): boolean {
        if (this.destroyed.get(null) == true) return false;
        super.destroy();
        this.destroyed.set(true);
        return true;
    }

    /**
     * Retrieves whether the menu has been destroyed
     * @param hook The hook to subscribe to changes
     * @returns Whether the menu was destroyed
     */
    public isDestroyed(hook: IDataHook = null): boolean {
        return this.destroyed.get(hook);
    }
}

import {IIOContext} from "../../context/_types/IIOContext";
import {IMenu} from "./_types/IMenu";
import {Field, IDataHook} from "model-react";
import {IMenuItem} from "../items/_types/IMenuItem";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {isItemSelectable} from "../items/isItemSelectable";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";

/**
 * An abstract menu class that doesn't deal with item management itself
 */
export abstract class AbstractMenu implements IMenu {
    protected context: IIOContext;
    protected destroyed = new Field(false);
    protected cursor = new Field(null as IMenuItem | null);
    protected selected = new Field([] as IMenuItem[]);

    /**
     * Creates a new abstract menu
     * @param context The context that menu items can use
     */
    public constructor(context: IIOContext) {
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
        if (this.getItems().includes(item) && !this.destroyed.get()) {
            const selectedItems = this.selected.get();
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
            !this.destroyed.get()
        ) {
            const currentCursor = this.cursor.get();
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
    public getSelected(hook?: IDataHook): IMenuItem[] {
        if (this.isDestroyed(hook)) return [];
        return this.selected.get(hook);
    }

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    public getCursor(hook?: IDataHook): IMenuItem | null {
        if (this.isDestroyed(hook)) return null;
        return this.cursor.get(hook);
    }

    /**
     * Retrieves all the selected items including the cursor
     * @param hook The hook to subscribe to changes
     * @returns The selected items including the cursor
     */
    public getAllSelected(hook?: IDataHook): IMenuItem[] {
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
        if (this.destroyed.get() == true) return false;

        // Select the selection
        onSelectAction.get(this.selected.get()).onSelect(false, this);

        // Decursor the cursor
        const cursor = this.cursor.get();
        if (cursor) onCursorAction.get([cursor]).onCursor(false, this);

        // Remove the items from the menu
        onMenuChangeAction.get(this.getItems()).onMenuChange(this, false);

        this.destroyed.set(true);
        return true;
    }

    /**
     * Retrieves whether the menu has been destroyed
     * @param hook The hook to subscribe to changes
     * @returns Whether the menu was destroyed
     */
    public isDestroyed(hook?: IDataHook): boolean {
        return this.destroyed.get(hook);
    }
}

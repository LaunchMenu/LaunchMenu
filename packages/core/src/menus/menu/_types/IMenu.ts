import {IDataHook} from "model-react";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IQuery} from "./IQuery";
import {IMenuCategoryData} from "./IMenuCategoryData";
import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * An interface for common menu interactions
 */
export type IMenu = {
    /**
     * Retrieves the context associated to the menu
     * @returns The context
     */
    getContext(): IIOContext;

    /**
     * Selects or deselects the given item
     * @param item The item to select or deselect
     * @param selected Whether to select or deselect
     */
    setSelected(item: IMenuItem, selected?: boolean): void;

    /**
     * Selects an item to be the cursor
     * @param item The new cursor
     */
    setCursor(item: IMenuItem): void;

    /**
     * Retrieves all items in the menu
     * @param hook The hook to subscribe to changes
     * @returns All items including category items in the correct sequence
     */
    getItems(hook?: IDataHook): IMenuItem[];

    /**
     * Retrieves all categories of the menu
     * @param hook The hook to subscribe to changes
     * @returns All categories and the items that belong to those categories, in the correct sequence
     */
    getCategories(hook?: IDataHook): IMenuCategoryData[];

    /**
     * Retrieves the currently selected items of the menu
     * @param hook The hook to subscribe to changes
     * @returns The selected menu items
     */
    getSelected(hook?: IDataHook): IMenuItem[];

    /**
     * Retrieves the item that's currently at the cursor of the menu
     * @param hook The hook to subscribe to changes
     * @returns The cursor item
     */
    getCursor(hook?: IDataHook): IMenuItem | null;

    /**
     * Retrieves all the selected items including the cursor
     * @param hook The hook to subscribe to changes
     * @returns The selected items including the cursor
     */
    getAllSelected(hook?: IDataHook): IMenuItem[];

    /**
     * Retrieves data that can be used to highlight parts of items
     * @param hook The hook to subscribe to changes
     * @returns The highlight data
     */
    getHighlight?: (hook?: IDataHook) => IQuery | null;

    /**
     * Properly destroys the menu
     * @returns Whether destroyed properly (returns false if it was already destroyed)
     */
    destroy(): boolean | Promise<boolean>;
};

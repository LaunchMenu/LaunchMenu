import {IStandardMenuItemData} from "./IStandardMenuItemData";
import {IMenuItem} from "./IMenuItem";

/**
 * The input data to create a category menu item with
 */
export type IFolderMenuItemData<T extends {[key: string]: IMenuItem} | IMenuItem[]> = {
    /** The children to show in this category */
    children: T;
    /** The children that should be included in searches, defaults to the value of children */
    searchChildren?: Partial<T>;
} & Omit<IStandardMenuItemData, "onExecute">;

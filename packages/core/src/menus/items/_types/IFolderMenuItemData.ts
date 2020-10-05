import {IStandardMenuItemData} from "./IStandardMenuItemData";
import {IMenuItem} from "./IMenuItem";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";

/**
 * The input data to create a category menu item with
 */
export type IFolderMenuItemData<
    T extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>,
    S extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]> = T
> = {
    /** The children to show in this category */
    children: T;
    /** The children that should be included in searches, defaults to the value of children */
    searchChildren?: S;
    /** Whether to close the menu when an active item is executed (defaults to false) */
    closeOnExecute?: boolean;
} & IStandardMenuItemData;

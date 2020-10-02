import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * Menu items together with their index in the input list for an action
 */
export type IIndexedMenuItem = {
    /** The position of the menu item in the list passed to an action */
    inputIndex: number;
} & IMenuItem;

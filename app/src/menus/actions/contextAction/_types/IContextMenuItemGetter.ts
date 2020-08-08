import {IMenuItem} from "../../../items/_types/IMenuItem";

/**
 * Retrieves the item to show in the context menu
 */
export type IContextMenuItemGetter = (close: () => void) => IMenuItem;

import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * A callback for when items of a menu are executed
 */
export type IMenuItemExecuteCallback = (items: IMenuItem[]) => void;

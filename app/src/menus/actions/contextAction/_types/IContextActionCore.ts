import {IActionCore} from "../../_types/IActionCore";
import {IContextMenuItemGetter} from "./IContextMenuItemGetter";

/**
 * The core transformer of a menu action
 */
export type IContextActionCore<
    I,
    O extends {getMenuItem: IContextMenuItemGetter}
> = IActionCore<I, O>;

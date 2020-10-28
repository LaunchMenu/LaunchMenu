import {INonFunction} from "../../../../_types/INonFunction";
import {IAction} from "../../_types/IAction";
import {IContextMenuItemGetter} from "./IContextMenuItemGetter";

/**
 * An action that can be shown in menus
 */
export type IContextAction<
    I extends INonFunction,
    O extends {getMenuItem: IContextMenuItemGetter}
> = IAction<I, O>;

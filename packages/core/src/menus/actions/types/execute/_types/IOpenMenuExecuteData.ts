import {ISubscribable} from "../../../../../utils/subscribables/_types/ISubscribable";
import {IMenuItem} from "../../../../items/_types/IMenuItem";

/**
 * The data that can be opened as a menu using the openMenuExecuteHandler action
 */
export type IOpenMenuExecuteData =
    | ISubscribable<IMenuItem[]>
    | {items: ISubscribable<IMenuItem[]>; closeOnExecute?: boolean; pathName?: string};

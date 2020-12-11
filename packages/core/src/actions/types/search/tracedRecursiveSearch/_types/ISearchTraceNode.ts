import {IIOContext} from "../../../../../context/_types/IIOContext";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {IShowChildInParent} from "./IShowChildInParent";

export type ISearchTraceNode = {
    /** Retrieves the menu item associated with this node */
    item: IMenuItem;
    /** Opens any required UI in order to show the specified child within its parent */
    showChild?: IShowChildInParent;
};

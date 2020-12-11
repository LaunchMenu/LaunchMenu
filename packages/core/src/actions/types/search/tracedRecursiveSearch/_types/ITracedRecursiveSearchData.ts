import {IIOContext} from "../../../../../context/_types/IIOContext";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {ISubscribable} from "../../../../../utils/subscribables/_types/ISubscribable";
import {IUUID} from "../../../../../_types/IUUID";
import {IMenuSearchable} from "../../_types/IMenuSearchable";
import {IShowChildInParent} from "./IShowChildInParent";

export type ITracedRecursiveSearchData = {
    /** The children of this item */
    children?: ISubscribable<IMenuItem[]>;
    /** Shows a given child, used to show child location */
    showChild?: IShowChildInParent;
    /** The ID of the menu item to show when matched, item can be attached using the identityAction */
    itemID: IUUID;
    /** The main search action */
    searchable: IMenuSearchable;
};

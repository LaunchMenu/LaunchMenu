import {IUUID} from "../../../../../_types/IUUID";
import {IMenuSearchable} from "../../_types/IMenuSearchable";
import {IShowChildInParent} from "./IShowChildInParent";
import {IRecursiveSearchChildren} from "./IRecursiveSearchChildren";
import {ISearchTraceNode} from "./ISearchTraceNode";

export type ITracedRecursiveSearchData =
    | ITracedRecursiveSimpleSearchData
    | ITracedRecursiveCustomSearchData;

/**
 * A simple template for handling recursive searches with tracing
 */
export type ITracedRecursiveSimpleSearchData = {
    /** The children of this item */
    children?: IRecursiveSearchChildren;
    /** Shows a given child, used to show child location */
    showChild?: IShowChildInParent;
    /** The ID of the menu item to show when matched, item can be attached using the identityAction */
    itemID: IUUID;
    /** The main search action */
    searchable: IMenuSearchable;
};

/**
 * A flexible custom recursive search transformer
 */
export type ITracedRecursiveCustomSearchData = (
    getTrace: () => ISearchTraceNode[]
) => IMenuSearchable;

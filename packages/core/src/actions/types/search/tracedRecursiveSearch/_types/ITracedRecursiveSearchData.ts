import {IUUID} from "../../../../../_types/IUUID";
import {IMenuSearchable} from "../../_types/IMenuSearchable";
import {IShowChildInParent} from "./IShowChildInParent";
import {IRecursiveSearchChildren} from "./IRecursiveSearchChildren";
import {ISearchTraceNode} from "./ISearchTraceNode";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {IDataHook} from "model-react";
import {ISearchableResult} from "../../../../../utils/searchExecuter/_types/ISearchable";
import {IPrioritizedMenuItem} from "../../../../../menus/menu/_types/IPrioritizedMenuItem";
import {SearchExecuter} from "../../../../../utils/searchExecuter/SearchExecuter";
import {IQuery} from "../../../../../menus/menu/_types/IQuery";

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
    /** An identifier for the searchable */
    ID: IUUID;
    /** Retrieves the main search action, providing the menu item that the search should reveal if matching */
    search: {
        /**
         * Performs the main search to determine whether the item matches
         * @param query The query to match against
         * @param getItem Retrieves the item that this search ran on, so most likely the one you want to return in case ite matches
         * @param hook The data hook to subscribe to changes
         * @param executer The search executer that started the search
         * @returns The search result, to which recursive children will be added automatically if defined
         */
        (
            query: IQuery,
            getItem: () => IMenuItem | undefined,
            hook: IDataHook,
            executer?: SearchExecuter<IQuery, IPrioritizedMenuItem>
        ): Promise<ISearchableResult<IQuery, IPrioritizedMenuItem>>;
    };
};

/**
 * A flexible custom recursive search transformer
 */
export type ITracedRecursiveCustomSearchData = (
    getTrace: () => ISearchTraceNode[]
) => IMenuSearchable;

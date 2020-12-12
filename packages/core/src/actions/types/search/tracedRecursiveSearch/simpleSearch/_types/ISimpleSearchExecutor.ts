import {IDataHook} from "model-react";
import {IMenuItem} from "../../../../../../menus/items/_types/IMenuItem";
import {IPrioritizedMenuItem} from "../../../../../../menus/menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../../../../../menus/menu/_types/IQuery";
import {SearchExecuter} from "../../../../../../utils/searchExecuter/SearchExecuter";
import {ISearchableResult} from "../../../../../../utils/searchExecuter/_types/ISearchable";
import {ISimpleSearchData} from "./ISimpleSearchData";

export type ISimpleSearchExecutor = {
    /**
     * Searches for items, by possibly returning an item, and a collection of sub-searches.
     * May also return a matched pattern to ignore all items that don't match a pattern.
     * @param searchData The search data to be used
     * @param getItem Retrieves the item that this data was for
     * @param query The query to be checked against
     * @param hook A data hook to listen for changes
     * @param executer The executer performing the search, for possible advanced optimizations
     * @returns The search result
     **/
    (
        searchData: ISimpleSearchData,
        getItem: () => IMenuItem | undefined,
        query: IQuery,
        hook: IDataHook,
        executer?: SearchExecuter<IQuery, IPrioritizedMenuItem>
    ): Promise<ISearchableResult<IQuery, IPrioritizedMenuItem>>;
};

import {IDataHook} from "model-react";
import {IUUID} from "../../../_types/IUUID";
import {SearchExecuter} from "../SearchExecuter";
import {IPatternMatch} from "./IPatternMatch";

/** Searchable data */
export type ISearchable<Q, I> = {
    /** The ID for this search (used to diff children) */
    id: IUUID;
    /**
     * Searches for items, by possibly returning an item, and a collection of sub-searches.
     * May also return a matched pattern to ignore all items that don't match a pattern.
     * @param query The query to be checked against
     * @param hook A data hook to listen for changes
     * @param executer The executer performing the search, for possible advanced optimizations
     * @returns The search result
     **/
    search(
        query: Q,
        hook: IDataHook,
        executer?: SearchExecuter<Q, I>
    ): Promise<{
        /** The item that may have been found */
        item?: I;
        /** The child items to search through */
        children?: ISearchable<Q, I>[];
        /** A pattern that this item matches, hiding all items that don't match any pattern */
        patternMatch?: IPatternMatch;
    }>;
};

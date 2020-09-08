import {IDataHook} from "model-react";
import {IUUID} from "../../../_types/IUUID";

/** Searchable data */
export type ISearchable<Q, I> = {
    /** The ID for this search (used to diff children) */
    id: IUUID;
    /** The search method to return the possible item and child searches */
    search(
        query: Q,
        hook: IDataHook
    ): Promise<{
        item?: I;
        children?: ISearchable<Q, I>[];
    }>;
};

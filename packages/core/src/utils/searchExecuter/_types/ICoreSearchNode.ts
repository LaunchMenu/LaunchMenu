import {IUUID} from "../../../_types/IUUID";
import {IPatternMatch} from "./IPatternMatch";
import {ISearchable} from "./ISearchable";

export type ICoreSearchNode<Q, I> = {
    /** The searchable that this is a node for */
    searchable: ISearchable<Q, I>;
    /** Tracks the removal scheduling state */
    removal: {
        /** Whether a removal is scheduled */
        scheduled: boolean;
        /** Whether a removal is required do to all parents being removed */
        required: boolean;
    };
    /** Tracks the update scheduling state, Also acts as addition state */
    update: {
        /** Whether an update or addition is scheduled */
        scheduled: boolean;
        /** Whether an update is required, if the node is just added or indicated a change */
        required: boolean;
    };
    /** The actual returned result of a searchable */
    result?: {
        /** The ids of found child nodes */
        children: Set<IUUID>;
        /** The found item */
        item?: I;
        /** The found pattern match */
        patternMatch?: IPatternMatch;
    };
    /** The set of parents of this node */
    parents: Set<IUUID>;
    /** The latest executed version (such that an older delayed result doesn't overwrite a newer one) */
    executeVersion: number;
    /** Whether this node has been deleted/removed */
    deleted?: boolean;
    /** A function that can be used to cancel a previous update hook */
    destroyHook?: () => void;
};

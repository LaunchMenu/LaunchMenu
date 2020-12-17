import {IUUID} from "../../../_types/IUUID";
import {IPatternMatch} from "./IPatternMatch";
import {ISearchable} from "./ISearchable";

/**
 * The resulting data that can be obtained by a search
 */
export type ICoreSearchResult<I> = {
    /** The item that wa found */
    item?: I;
    /** The patter that was found */
    patternMatch?: IPatternMatch;
};

/**
 * The config for the core search executer
 */
export type ICoreSearchExecuterConfig<Q, I> = {
    /**
     * The update function to call when a search node updated (or added) its results
     * @param ID The ID of the node whose results updated
     * @param result The new result of the search node
     * @param oldResult The previous result of the search node
     */
    onUpdate: (
        ID: IUUID,
        result: ICoreSearchResult<I>,
        oldResult?: ICoreSearchResult<I>
    ) => void;
    /**
     * The remove function to call when a search node was removed
     * @param ID The ID of the node that was removed
     * @param oldResult The previous result of the search node that's removed
     */
    onRemove: (ID: IUUID, oldResult: ICoreSearchResult<I>) => void;
    /** The searchable root node */
    searchable: ISearchable<Q, I>;
};

import {IPatternMatch} from "./IPatternMatch";
import {ISearchable} from "./ISearchable";

/**
 * The configuration object for a search executer
 */
export type ISearchExecuterConfig<Q, I> = {
    /** The searchable to search through */
    searchable: ISearchable<Q, I>;
    /** The item add callback */
    onAdd?: (item: I) => void;
    /** The item remove callback */
    onRemove?: (item: I) => void;
    /** A function to determine whether a retrieved pattern match is a new pattern match, or possibly shouldn't be a match at all (Defaults to a deep equality match finder)*/
    getPatternMatch?: (
        match: IPatternMatch,
        currentMatches: IPatternMatch[]
    ) => IPatternMatch | undefined;
};

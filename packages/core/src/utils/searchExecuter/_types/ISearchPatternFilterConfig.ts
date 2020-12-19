import {IPatternMatch} from "./IPatternMatch";

/** The config for the search pattern filter */
export type ISearchPatternFilterConfig<I> = {
    /**
     * The callback for when an item is added
     * @param item The item that was found
     */
    onAdd: (item: I) => void;
    /**
     * The callback for when an item is removed
     * @param item The item that was removed
     */
    onRemove: (item: I) => void;
    /**
     * Retrieves the pattern match to be used. Can be used to make sure no duplicate patterns are found (E.G. patterns with deep but not reference equality).
     * Defaults to a deep equality checker.
     */
    getPatternMatch?: (
        match: IPatternMatch,
        currentMatches: IPatternMatch[]
    ) => IPatternMatch | undefined;
};

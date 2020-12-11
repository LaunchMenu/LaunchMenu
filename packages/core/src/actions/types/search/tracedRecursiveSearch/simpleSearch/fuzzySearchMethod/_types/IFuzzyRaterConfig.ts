import {IFuzzinessIntensity} from "./IFuzzinessIntensity";

/**
 * Configuration for a fuzzy rater instance
 */
export type IFuzzyRaterConfig = {
    /** The relative cost of not being able to match 1 of the search words in the correct order */
    skipPenalty: number;
    /** The relative cost of not being able to match 1 word at all, (will also apply skip penalty in addition) */
    missingPenalty: number;
    /** The relative cost of having a typo in a word */
    typoPenalty: number;
    /** The penalty for search words being found 1 character apart (distance is multiplied by penalty) */
    distancePenalty: number;
    /** How fuzzy the search should be, how many typos are allowed */
    fuzziness: IFuzzinessIntensity;
    /** Whether searches should be case sensitive */
    caseSensitive: boolean;
    /** Whether to also show results that didn't include all search words */
    allowPartialMatches: boolean;
    /** The sum of penalties above which results should dropped */
    maximumCost: number;
};

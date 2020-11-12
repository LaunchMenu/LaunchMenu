import {IQuery} from "../../../../../menus/menu/_types/IQuery";
import {SimpleSearchMatcher} from "../SimpleSearchMatcher";

export const simpleMatchRetriever = Symbol("Simple regex");

/**
 * The regex used for a simple search
 */
export type ISimpleSearchQuery = {
    /**
     * Retrieves how well some text matches the search, the higher the better
     * @param text The text to test
     * @returns How well the text matches
     */
    [simpleMatchRetriever]: SimpleSearchMatcher;
};

/**
 * Determines whether a given query is a simple search query
 * @param query The query to check
 * @returns Whether the given query is a search query
 */
export function isSimpleSearchQuery(query: IQuery): query is IQuery & ISimpleSearchQuery {
    return simpleMatchRetriever in query;
}

import {IDataHook} from "model-react";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {IPatternMatch} from "../../../utils/searchExecuter/_types/IPatternMatch";
import {IStandardSearchPatternMatcherConfig} from "./_types/IStandardSearchPatternMatcherConfig";

/**
 * Creates a new standard pattern matcher
 * @param config The configuration for the matcher
 * @returns The function that can be used to match this pattern
 */
export function createStandardSearchPatternMatcher<T = void>({
    name,
    matcher: orMatcher,
    highlighter,
}: IStandardSearchPatternMatcherConfig<T>): {
    /**
     * Checks whether the given query matches the pattern, and caches the result in the query
     * @param query The query to match
     * @param hook The data hook to subscribe to changes
     * @returns The pattern that was matched, if any
     */
    (query: IQuery, hook?: IDataHook): (IPatternMatch & {metadata?: T}) | undefined;
} {
    const symbol = Symbol(name);

    return (
        query: IQuery & {[symbol]?: (IPatternMatch & {metadata?: T}) | undefined},
        hook
    ) => {
        // If the result wasn't already computed for this query, compute it
        if (!(symbol in query)) {
            // Obtain the matcher
            let matcher =
                orMatcher instanceof Function ? orMatcher(query, hook) : orMatcher;
            if (!matcher) return undefined;

            // Reduce a regular expression to a text selection
            if (matcher instanceof RegExp) {
                const selections: ITextSelection[] = [];
                let m: RegExpExecArray | null;
                if (matcher.global) {
                    while ((m = matcher.exec(query.search)))
                        selections.push({start: m.index, end: m.index + m[0].length});
                } else {
                    if ((m = matcher.exec(query.search)))
                        selections.push({start: m.index, end: m.index + m[0].length});
                }
                matcher = selections;
            }

            // Reduce a text selection to a pattern match
            if (matcher instanceof Array) {
                if (matcher.length == 0) return undefined;
                matcher = {
                    highlight: matcher,
                };
            }

            // Store the pattern match
            const searchText =
                matcher.highlight
                    ?.sort(({end: a}, {end: b}) => b - a)
                    .reduce(
                        (text, node) => text.slice(0, node.start) + text.slice(node.end),
                        query.search
                    ) ?? query.search;
            const pattern = {
                name,
                highlighter,
                searchText,
                ...matcher,
            };
            query[symbol] = pattern;
        }

        // Return the pattern that was found for this query
        return query[symbol];
    };
}

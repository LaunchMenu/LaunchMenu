import {highlightTags} from "../../../../../textFields/syntax/utils/highlightTags";
import {IHighlightNode} from "../../../../../textFields/syntax/_types/IHighlightNode";
import {ISearchHighlighterNode} from "../../_types/ISearchHighlighter";

/**
 * Rates how well the given text contains the query
 * @param text The text to be rated
 * @param query The query to perform
 * @returns The rating
 */
export function fuzzyRate(
    text: string,
    query: string
): {
    /** The accuracy of 1 or more found 'matches' (may not be a match, if accuracy is 0) */
    accuracy: number[];
    /** Retrieves data that can be used for highlighting */
    getHighlightData: () => IHighlightNode[];
} {
    const t = [[0]] as number[][];
    const tl = text.length;
    const ql = query.length;
    if (tl == 0) return {accuracy: [0], getHighlightData: () => []};

    // Initialize the first table column, and checks for exact matches
    let charIndex = 0;
    const matches = [] as (ISearchHighlighterNode & {withBoundaries: boolean})[];
    for (let i = 0; i < tl; i++) {
        t[i + 1] = [0]; // Don't charge anything as long as the match hasn't started
        if (query[charIndex] == text[i]) {
            charIndex++;
            if (charIndex == ql) {
                charIndex = 0;

                const end = i + 1;
                const start = end - ql;
                const withBoundaries = text[start - 1] == " " && text[end] == " ";
                matches.push({
                    start,
                    end,
                    withBoundaries,
                });
            }
        } else charIndex = 0;
    }

    // Initialize the first table row
    for (let j = 1; j <= ql; j++) t[0][j] = j;

    // If exact matches were found, return
    if (matches.length > 0)
        return {
            accuracy: matches.map(({withBoundaries}) => (withBoundaries ? 1 : 0.9)),
            getHighlightData: () =>
                matches.map(({start, end}) => ({
                    start,
                    end,
                    text: text.substring(start, end),
                    tags: [highlightTags.searchHighlight],
                })),
        };

    // Fill the table
    for (let i = 1; i <= tl; i++) {
        for (let j = 1; j <= ql; j++) {
            const skipQuery = t[i][j - 1] + 1;
            const useTextCost = j < ql; // Don't charge cor skipping text when the has started, or already finished
            const skipText = t[i - 1][j] + (useTextCost as any) * 1;
            let best = Math.min(skipQuery, skipText);

            // If the characters match, consider no changes too
            if (text[i - 1] == query[j - 1]) best = Math.min(best, t[i - 1][j - 1]);

            t[i][j] = best;
        }
    }

    // Return the result, with a function that can be used to extract the highlight data
    const res = t[tl][ql];
    return {
        accuracy: [1 - res / ql],
        getHighlightData: () => {
            let i = tl,
                j = ql;
            const matches = [] as ISearchHighlighterNode[];

            let prev: ISearchHighlighterNode & {type: number} = {
                type: 1, // Ignore initial text skips, since it will be added to this node (which isn't stored)
                start: 0,
                end: tl,
            };
            while (i > 0 && j > 0) {
                // Find the cost of all scenarios
                const skipQuery = t[i][j - 1];
                const skipText = t[i - 1][j];
                let matchChar = Infinity;
                if (text[i - 1] == query[j - 1]) matchChar = t[i - 1][j - 1];

                // Determine what scenario was taken
                let min = Math.min(skipQuery, skipText, matchChar);
                if (matchChar == min) {
                    i -= 1;
                    j -= 1;
                    if (prev.type != 0) {
                        prev = {
                            type: 0,
                            start: i,
                            end: i + 1,
                            tags: [highlightTags.searchHighlight],
                        };
                        matches.push(prev);
                    }
                    prev.start = i;
                } else if (skipText == min) {
                    i -= 1;
                    if (prev.type != 1) {
                        prev = {
                            type: 1,
                            start: i,
                            end: i + 1,
                            tags: [highlightTags.error],
                        };
                        matches.push(prev);
                    }
                    prev.start = i;
                } else {
                    j -= 1;
                    if (prev.type != 2) {
                        prev = {
                            type: 2,
                            start: i,
                            end: i,
                            tags: [highlightTags.empty, highlightTags.error],
                        };
                        matches.push(prev);
                    }
                }
            }

            return matches.reverse().map(({start, end, tags}) => ({
                start,
                end,
                text: text.substring(start, end),
                tags: tags || [],
            }));
        },
    };
}

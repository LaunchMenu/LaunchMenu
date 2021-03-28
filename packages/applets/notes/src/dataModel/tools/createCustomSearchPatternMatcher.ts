import execWithIndices from "regexp-match-indices";
import {
    createStandardSearchPatternMatcher,
    highlightTags,
    IHighlightNode,
    ISimpleSearchPatternMatcher,
    mergeHighlightNodes,
} from "@launchmenu/core";
import {DataCacher, IDataRetriever} from "model-react";
import Color from "color";

/**
 * Creates a custom search pattern matcher according to some user search pattern
 * @param getPattern The pattern to use, may use capture groups prefixed with `$` for text to be included in the search, and capture groups `#fff` or similar hex patterns for highlighting
 * @param getName The name for the matcher
 * @returns The search pattern matcher
 */
export function createCustomSearchPatternMatcher(
    getPattern: IDataRetriever<string | undefined>,
    getName?: IDataRetriever<string>
): ISimpleSearchPatternMatcher {
    const searchPatternMatcher = new DataCacher<{
        matcher?: ISimpleSearchPatternMatcher;
        pattern?: string;
    }>((hook, prev) => {
        // Retrieve the updated pattern and make sure it changes
        const pattern = getPattern(hook);
        if (prev && pattern == prev?.pattern) return prev;
        if (pattern == undefined) return {pattern};

        // Try to create a regex matcher
        const regex = /\/(.*)\/(.*)/;
        const match = regex.exec(pattern);
        if (match)
            try {
                const regex = new RegExp(match[1], match[2]);
                return {
                    pattern,
                    matcher: ({search}, hook) => {
                        // Try to match the regex
                        const match = execWithIndices(regex, search);
                        if (!match) return;

                        // Compute the search text
                        const groups = match.indices.groups;
                        let highlight: IHighlightNode[] = [
                            {
                                start: match.index,
                                end: match.index + match[0].length,
                                text: match[0],
                                tags: [highlightTags.patternMatch],
                            },
                        ];
                        let searchText =
                            search.substring(0, match.index) +
                            search.substring(match.index + match[0].length);
                        if (groups) {
                            const result = getNodesFromGroups(groups, highlight, search);
                            highlight = result.highlight;
                            searchText = result.searchText + searchText;
                        }

                        // Return the selection and text
                        return {
                            name: getName?.(hook) ?? pattern,
                            id: pattern,
                            searchText,
                            highlight,
                        };
                    },
                };
            } catch (e) {}

        // Create a literal text matcher
        return {
            pattern,
            matcher: createStandardSearchPatternMatcher({
                name: getName?.(hook) ?? pattern,
                id: pattern,
                matcher: ({search}) =>
                    search.slice(0, pattern.length) == pattern
                        ? [{start: 0, end: pattern.length}]
                        : undefined,
            }),
        };
    });

    /** Return the pattern matcher */
    return (query, hook) => searchPatternMatcher.get(hook).matcher?.(query, hook);
}

/**
 * Retrieves the highlight nodes and search text from the regex groups
 * @param groups The regex groups
 * @param highlight The highlight nodes
 * @param search The search text
 * @returns The search text and highlight nodes
 */
function getNodesFromGroups(
    groups: {
        [key: string]: [number, number];
    },
    highlight: IHighlightNode[],
    search: string
): {searchText: string; highlight: IHighlightNode[]} {
    const {nodes, textItems} = Object.entries(groups)
        .filter(([, range]) => range)
        .reduce(
            ({nodes, textItems}, [key, [start, end]]) => {
                if (start != end) {
                    const colorMatch = key.match(/c.*_(.+)/);
                    if (colorMatch) {
                        // Add a highlight node
                        const colorString = colorMatch[1];
                        let color: string;
                        try {
                            new Color("#" + colorString);
                            color = "#" + colorString;
                        } catch (e) {
                            color = colorString;
                        }

                        const node = {
                            start,
                            end,
                            text: search.substring(start, end),
                            tags: [],
                            style: {color},
                        };
                        return {
                            nodes: mergeHighlightNodes([node], nodes),
                            textItems,
                        };
                    } else if (key.slice(0, 2) == "t_") {
                        // Add a text range
                        return {
                            nodes,
                            textItems: [
                                {index: start, text: search.substring(start, end)},
                                ...textItems,
                            ],
                        };
                    }
                }

                return {nodes, textItems};
            },
            {
                nodes: highlight,
                textItems: [] as {text: string; index: number}[],
            }
        );

    // Retrieve the search text and highlight nodes
    return {
        highlight: nodes,
        searchText: textItems
            .sort(({index: a}, {index: b}) => a - b)
            .reduce(
                (allText, {text, index}, i, items) =>
                    allText + text.substr(0, (items[i + 1]?.index || Infinity) - index),
                ""
            ),
    };
}

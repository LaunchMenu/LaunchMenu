import {useDataHook} from "model-react";
import React, {memo} from "react";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {useBackgroundColor} from "../../../styling/backgroundColorContext";
import {highlightTags} from "../../../textFields/syntax/utils/highlightTags";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {LFC} from "../../../_types/LFC";
import {ISearchHighlighter} from "./_types/ISearchHighlighter";

/**
 * A search highlighter that can be used to highlighter text in search results
 */
export const SearchHighlighter: LFC<{
    /** The text to be highlighter */
    text: ISubscribable<string>;
    /** The text to search for and highlight */
    searchText: string;
    /** The query to use for highlighting */
    query: IQuery;
    /** The search highlighter to be used */
    searchHighlighter: ISearchHighlighter;
}> = memo(({text: inpText, query, searchHighlighter, searchText}) => {
    const [h] = useDataHook();
    const {isDark} = useBackgroundColor();

    // Get the highlight data
    const text = getHooked(inpText, h);
    const nodes = searchHighlighter(text, searchText, query);

    // Normalize the data, filling any gaps
    nodes.sort(({end: a}, {end: b}) => a - b);
    const normalizedNodes = [] as IHighlightNode[];
    let prevEnd = 0;
    nodes.forEach(({start, end, tags, text: t}) => {
        if (prevEnd < start)
            normalizedNodes.push({
                start: prevEnd,
                end: start,
                tags: [],
                text: text.substring(prevEnd, start),
            });
        normalizedNodes.push({
            tags: tags || [highlightTags.searchHighlight],
            start,
            end,
            text: t || text.substring(start, end),
        });

        prevEnd = end;
    });
    if (prevEnd < text.length) {
        normalizedNodes.push({
            start: prevEnd,
            end: text.length,
            tags: [],
            text: text.substring(prevEnd),
        });
    }

    // Make the highlighting dark, if the current background isn't dark
    if (!isDark)
        normalizedNodes.forEach(node => node.tags.push(highlightTags.darkBackground));

    // Highlight the data
    return (
        <>
            {normalizedNodes.map(({start, end, text, tags}) => (
                <span key={`${start}-${end}`} className={tags?.join(" ")}>
                    {text}
                </span>
            ))}
        </>
    );
});

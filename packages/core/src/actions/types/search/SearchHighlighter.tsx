import React from "react";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {useBackgroundColor} from "../../../styling/backgroundColorContext";
import {highlightTags} from "../../../textFields/syntax/utils/highlightTags";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {LFC} from "../../../_types/LFC";
import {ISearchHighlighter} from "./_types/ISearchHighlighter";
import {ISearchHighlighterProps} from "./_types/ISearchHighlighterProps";

/**
 * A search highlighter that can be used to highlighter text in search results
 */
export const SearchHighlighter: LFC<{
    /** The text to be highlighter */
    text: ISubscribable<string>;
    /** The query to use for highlighting */
    query: IQuery;
    /** The search higlighter to be used */
    searchHighlighter: ISearchHighlighter;
}> = ({text: inpText, query, searchHighlighter}) => {
    const [h] = useDataHook();
    const {isDark} = useBackgroundColor();

    // Get the highlight data
    const text = getHooked(inpText, h);
    const nodes = searchHighlighter(text, query);

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
            {normalizedNodes.map(({start, text, tags}) => (
                <span key={start} className={tags?.join(" ")}>
                    {text}
                </span>
            ))}
        </>
    );
};

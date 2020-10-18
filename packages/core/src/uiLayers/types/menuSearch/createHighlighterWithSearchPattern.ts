import {IDataHook} from "model-react";
import {IPatternMatch} from "../../../utils/searchExecuter/_types/IPatternMatch";
import {plaintextLexer} from "../../../textFields/syntax/plaintextLexer";
import {addHighlightNodeTags} from "../../../textFields/syntax/utils/addHighlightNodeTags";
import {highlightTags} from "../../../textFields/syntax/utils/highlightTags";
import {IHighlighter} from "../../../textFields/syntax/_types/IHighlighter";

/**
 * Creates a highlighter that matches search patterns
 * @param patternGetter The patterns to be highlighted
 * @param defaultHighlighter The highlighter to extend, or the plain text highlighter if left out
 * @param usePatternHighlighter Whether to inherit the highlighter from a search pattern when available
 * @returns The augmented or created highlighter
 */
export function createHighlighterWithSearchPattern(
    patternGetter: (h?: IDataHook) => IPatternMatch[],
    defaultHighlighter: IHighlighter = plaintextLexer,
    usePatternHighlighter: boolean = true
): IHighlighter {
    return {
        highlight: (syntax, h) => {
            const patternMatches = patternGetter(h);

            let highlighter = defaultHighlighter;
            if (
                usePatternHighlighter &&
                patternMatches.length == 1 &&
                patternMatches[0].highlighter
            )
                highlighter = patternMatches[0].highlighter;
            const {nodes, errors} = highlighter.highlight(syntax);

            // Augment the node tags with the specified new tags
            let newNodes = nodes;
            patternMatches.forEach(pattern => {
                if (pattern.highlight)
                    pattern.highlight.forEach(node => {
                        newNodes = addHighlightNodeTags(
                            newNodes,
                            node.start,
                            node.end,
                            "tags" in node ? node.tags : [highlightTags.patternMatch]
                        );
                    });
            });

            // Return the newly created nodes and the errors
            return {
                nodes: newNodes,
                errors,
            };
        },
    };
}

import {IHighlightNode} from "../_types/IHighlightNode";
import {IHighlightError} from "../_types/IHighlightError";
import {addHighlightNodeTags} from "./addHighlightNodeTags";

/**
 * Adds tags to the given nodes in order to indicate errors within them
 * @param nodes The nodes to add tags to
 * @param errors The errors to add tags for
 * @returns The resulting nodes
 */
export function highlightTagErrors(
    nodes: IHighlightNode[],
    errors: IHighlightError[]
): IHighlightNode[] {
    let resultingNodes = nodes;
    errors.forEach(error => {
        const tags = ["error"];
        if (typeof error.type == "string") tags.push(error.type);
        resultingNodes = addHighlightNodeTags(
            resultingNodes,
            error.syntaxRange.start,
            error.syntaxRange.end,
            tags
        );
    });
    return resultingNodes;
}

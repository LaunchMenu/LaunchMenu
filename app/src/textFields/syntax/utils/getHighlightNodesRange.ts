import {IHighlightNode} from "../_types/IHighlightNode";

/**
 * Retrieves a text sub range of the nodes
 * @param nodes The nodes to get a sub range of
 * @param start The start index of the sub range
 * @param end The end index of the sub range
 * @returns The sub range of the nodes
 */
export function getHighlightNodesRange(
    nodes: IHighlightNode[],
    start: number,
    end: number
): IHighlightNode[] {
    return nodes.flatMap(node => {
        if (node.end <= start || node.start >= end) return [];
        if (node.start < start)
            node = {
                start,
                end: node.end,
                tags: node.tags,
                text: node.text.substring(start - node.start),
            };
        if (node.end > end)
            node = {
                start: node.start,
                end,
                tags: node.tags,
                text: node.text.substring(0, end - node.start),
            };
        return node;
    });
}

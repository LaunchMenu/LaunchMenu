import {IHighlightNode} from "../_types/IHighlightNode";

/**
 * Splits a node into multiple nodes
 * @param node The node to split
 * @param index The character index to split it at
 * @returns The resulting nodes
 */
export function splitHighlightNode(
    node: IHighlightNode,
    index: number
): [IHighlightNode, IHighlightNode | undefined] {
    if (node.start < index && node.end > index) {
        return [
            {
                start: node.start,
                end: index,
                text: node.text.substr(0, index - node.start),
                tags: node.tags,
            },
            {
                start: index,
                end: node.end,
                text: node.text.substr(index - node.start),
                tags: node.tags,
            },
        ];
    } else {
        return [node, undefined];
    }
}

/**
 * Creates a new collection of nodes by adding the given tags to the text within some range
 * @param nodes The nodes to add the tags to
 * @param start The start of the range
 * @param end The end of the range
 * @param tags The tags to be added
 * @returns The resulting collection of nodes
 */
export function addHighlightNodeTags(
    nodes: IHighlightNode[],
    start: number,
    end: number,
    tags: string[]
): IHighlightNode[] {
    let out: IHighlightNode[] = [];

    // Insert an empty node at the start if needed
    if (start == 0 && end == 0) out.push({start, end, text: "", tags});

    // Check whether to split any nodes and add the tags
    nodes.forEach(node => {
        const overlaps = node.start < end && node.end > start;
        if (overlaps) {
            // Split off section of the node before the range
            if (node.start < start) {
                const [beforeRange, inRange] = splitHighlightNode(node, start);
                if (inRange) {
                    out.push(beforeRange);
                    node = inRange;
                }
            }

            // Split off section of the node after the range
            let after: IHighlightNode | undefined;
            if (node.end > end) {
                const [inRange, afterRange] = splitHighlightNode(node, end);
                if (afterRange) {
                    after = afterRange;
                    node = inRange;
                }
            }

            // Add the new node to the tag
            out.push({...node, tags: [...node.tags, ...tags]});

            // Add the section after if any exists
            if (after) out.push(after);
        } else out.push(node);

        // Check whether to insert an empty error node after this node
        if (node.end == start && node.end == end) out.push({start, end, text: "", tags});
    });
    return out;
}

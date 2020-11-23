import {IHighlightNode} from "../_types/IHighlightNode";
import {splitHighlightNode} from "./addHighlightNodeTags";

// TODO: write some unit tests for this
/**
 * Merges the tags of 2 collections of nodes, assumes these are nodes for the same input text
 * @param targets The nodes to add the tags to
 * @param sources The nodes to take the tags from
 * @returns The resulting collection of nodes
 */
export function mergeHighlightNodes(
    targets: IHighlightNode[],
    sources: IHighlightNode[]
): IHighlightNode[] {
    let out: IHighlightNode[] = [];

    let ti = 0;
    let si = 0;
    let source = sources[si];
    let target = targets[ti];

    // Check whether to split any nodes and add the tags
    while (source && target) {
        if (target.end < source.start) {
            // This target isn't affected by the source, just add it as it is
            out.push(target);
            target = targets[++ti];
        } else if (source.end < target.start) {
            // The source is fully in front of the target, just add it as it is
            out.push(source);
            source = sources[++si];
        } else if (source.end == source.start) {
            // If the source is an empty range, either merge with another empty range, or insert before
            if (target.end == target.start) {
                out.push({...target, tags: [...target.tags, ...source.tags]});
                target = targets[++ti];
            } else out.push(source);
            source = sources[++si];
        } else {
            // The source and target overlap

            // Split off section of the node before the range
            if (target.start < source.start) {
                const [beforeRange, inRange] = splitHighlightNode(target, source.start);
                if (inRange) {
                    out.push(beforeRange);
                    target = inRange;
                }
            }

            // Split off section of the node after the range
            let overlap: IHighlightNode | undefined;
            if (target.end > source.end) {
                const [inRange, afterRange] = splitHighlightNode(target, source.end);
                if (afterRange) {
                    overlap = inRange;
                    target = afterRange;
                }
            }
            if (!overlap) {
                overlap = target;
                target = targets[++ti];
            }

            // Add the new node to the tag
            out.push({...overlap, tags: [...overlap.tags, ...source.tags]});

            // Split off any part of the source that overlaps with this node
            const [sourceOverlap, sourceAfterOverlap] = splitHighlightNode(
                source,
                overlap.end
            );
            if (sourceAfterOverlap) {
                source = sourceAfterOverlap;
            } else {
                source = sources[++si];
            }
        }
    }

    // Add any remaining nodes, which don't require merging
    while (target) {
        out.push(target);
        target = targets[++ti];
    }
    while (source) {
        out.push(source);
        source = sources[++si];
    }

    // Return the result
    return out;
}

/**
 * A node for containing the syntax highlighting information
 */
export type IHighlightNode = {
    /** The tags for the highlighting */
    tags: string[];
    /** The start of the node */
    start: number;
    /** The end of the node */
    end: number;
    /** The text of the node */
    text: string;
};

import {IHighlightNode} from "./IHighlightNode";
import {IHighlightError} from "./IHighlightError";

/**
 * A type that can be used to extract highlight data
 */
export type IHighlighter = {
    /**
     * Extracts the highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @returns The highlight nodes and possibly syntax and or semantic errors
     */
    highlight(syntax: string): {nodes: IHighlightNode[]; errors: IHighlightError[]};
};

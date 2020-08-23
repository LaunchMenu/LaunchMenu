import {IHighlightNode} from "./IHighlightNode";
import {IHighlightError} from "./IHighlightError";
import {IDataHook} from "model-react";

/**
 * A type that can be used to extract highlight data
 */
export type IHighlighter = {
    /**
     * Extracts the highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @param hook The hook to subscribe to changes
     * @returns The highlight nodes and possibly syntax and or semantic errors
     */
    highlight(
        syntax: string,
        hook?: IDataHook
    ): {nodes: IHighlightNode[]; errors: IHighlightError[]};
};

import {IHighlightNode} from "../../../../textFields/syntax/_types/IHighlightNode";

export type ISyntaxHighlighterNodesListenerProps = {
    /**
     * A callback for when the mouse went down on a character
     * @param evt The mouse event
     * @param index The index including the fraction to the next index
     */
    onMouseDown?: (
        evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        indexCont: number
    ) => void;
    /**
     * A callback for when the mouse went up on a character
     * @param evt The mouse event
     * @param index The index including the fraction to the next index
     */
    onMouseUp?: (
        evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        indexCont: number
    ) => void;
    /**
     * A callback for when the mouse was moved
     * @param evt The mouse event
     * @param index The index including the fraction to the next index
     */
    onMouseMove?: (
        evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        indexCont: number
    ) => void;
};

export type ISyntaxHighlighterNodesProps = ISyntaxHighlighterNodesListenerProps & {
    nodes: IHighlightNode[];
    children?: never;
};

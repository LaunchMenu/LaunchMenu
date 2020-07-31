import {ITextSelection} from "../../../../textFields/_types/ITextSelection";
import {IHighlightNode} from "../../../../textFields/syntax/_types/IHighlightNode";

export type ISyntaxHighlighterSelectionProps = {
    nodes: IHighlightNode[];
    selection: ITextSelection;
    getPixelSelection?: (pixelSelection?: {start: number; end?: number}) => void;
};

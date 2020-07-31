import {ITextSelection} from "../../../../textFields/_types/ITextSelection";

export type ISyntaxHighlighterSelectionProps = {
    selection: ITextSelection;
    getPixelSelection?: (pixelSelection?: {start: number; end?: number}) => void;
};

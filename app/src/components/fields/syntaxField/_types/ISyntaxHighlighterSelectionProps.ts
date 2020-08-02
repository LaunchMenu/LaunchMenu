import {ITextSelection} from "../../../../textFields/_types/ITextSelection";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";

export type ISyntaxHighlighterSelectionProps = {
    selection: ITextSelection;
    getPixelSelection?: (pixelSelection?: {start: number; end?: number}) => void;
} & IBoxProps;

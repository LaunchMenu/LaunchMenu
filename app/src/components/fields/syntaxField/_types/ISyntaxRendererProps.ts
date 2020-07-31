import {ISyntaxHighlighterProps} from "./ISyntaxHighlighterProps";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";

export type ISyntaxRendererProps = ISyntaxHighlighterProps & {
    selection?: ITextSelection;
    onSelectionChange?: (selection: ITextSelection) => void;
    value?: string;
};

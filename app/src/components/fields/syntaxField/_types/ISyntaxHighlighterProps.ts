import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {IHighlightError} from "../../../../textFields/syntax/_types/IHighlightError";
import {IHighlightTheme} from "../../../../styling/theming/highlighting/_types/IHighlightTheme";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";
import {ISyntaxHighlighterNodesListenerProps} from "./ISyntaxHighlighterNodesProps";

export type ISyntaxHighlighterProps = {
    value: string;

    highlighter: IHighlighter;
    theme?: IHighlightTheme;

    selection?: ITextSelection;
    onSelectionChange?: (selection: ITextSelection) => void;

    /** A callback for any (syntax) errors that may have occurred */
    setErrors?: (errors: IHighlightError[]) => void;
    children?: never;
} & ISyntaxHighlighterNodesListenerProps &
    IBoxProps;

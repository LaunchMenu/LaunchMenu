import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {IHighlightError} from "../../../../textFields/syntax/_types/IHighlightError";
import {IHighlightTheme} from "../../../../styling/theming/highlighting/_types/IHighlightTheme";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";
import {ISyntaxHighlighterNodesListenerProps} from "./ISyntaxHighlighterNodesProps";
import {IHighlightNode} from "../../../../textFields/syntax/_types/IHighlightNode";

export type ISyntaxHighlighterProps = (
    | {
          /** The textual value to highlight */
          value: string;

          /** The highlighter to perform the highlight with */
          highlighter: IHighlighter;
          /** Whether or not to highlight errors */
          highlightErrors?: boolean;
          /** A callback for any (syntax) errors that may have occurred */
          setErrors?: (errors: IHighlightError[]) => void;
      }
    | {
          /** The nodes to highlight with */
          nodes: IHighlightNode[];
      }
) & {
    /** The highlighting theme to apply styles from */
    theme?: IHighlightTheme;

    /** The currently selected text */
    selection?: ITextSelection;
    /** A listener for mouse input selection changes */
    onSelectionChange?: (selection: ITextSelection) => void;

    /** Element may not have children */
    children?: never;
} & ISyntaxHighlighterNodesListenerProps &
    IBoxProps;

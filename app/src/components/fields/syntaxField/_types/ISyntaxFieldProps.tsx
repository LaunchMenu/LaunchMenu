import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {IHighlightError} from "../../../../textFields/syntax/_types/IHighlightError";
import {ITextField} from "../../../../textFields/_types/ITextField";

export type ISyntaxFieldProps = {
    /** The text field to highlight from */
    field: ITextField;
    /** The highlighter to perform the highlight with */
    highlighter: IHighlighter;
    /** A callback for any (syntax) errors that may have occurred */
    setErrors?: (errors: IHighlightError[]) => void;
    /** Whether to highlight errors, or the duration to not highlight errors for after typing*/
    highlightErrors?: number | boolean;
};

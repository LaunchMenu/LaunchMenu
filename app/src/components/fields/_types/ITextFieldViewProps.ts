import {IBoxProps} from "../../../styling/box/_types/IBoxProps";
import {ReactElement} from "react";
import {ITextField} from "../../../textFields/_types/ITextField";
import {IHighlighter} from "../../../textFields/syntax/_types/IHighlighter";
import {IHighlightError} from "../../../textFields/syntax/_types/IHighlightError";
import {IThemeIcon} from "../../../styling/theming/_types/IBaseTheme";

export type ITextFieldViewProps = {
    /** The text field to visualize */
    field: ITextField;
    /** The highlighter to perform the highlight with */
    highlighter?: IHighlighter;
    /** A callback for any (syntax) errors that may have occurred */
    setErrors?: (errors: IHighlightError[]) => void;
    /** Whether to highlight errors, or the duration to not highlight errors for after typing*/
    highlightErrors?: number | boolean;
    /** The icon to show at the start of the field */
    icon?: IThemeIcon | ReactElement;
} & IBoxProps;

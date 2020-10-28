import {ReactElement, ReactNode} from "react";
import {IThemeIcon} from "../../../../styling/theming/_types/IBaseTheme";
import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {IInputError} from "./IInputError";

/**
 * A config object for input fields
 */
export type IInputConfig<T> = {
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputError | undefined;
    /** The function to transform the field value into a string */
    serialize?: (v: T) => string;
    /** The function to transform the input string to a valid field value (if the input is valid) */
    deserialize?: (v: string) => T;
    /** Whether to only update on any valid input, or only when the input field (defaults to true)*/
    liveUpdate?: boolean;
    /** Whether to dispatch a command on submit (defaults to false, can't be combined with liveUpdate or onSubmit) */
    undoable?: boolean;
    /** The icon to be shown for the input */
    icon?: IThemeIcon | ReactElement;
    /** The highlighter to use for the input */
    highlighter?: IHighlighter;
    /** Whether to allow usage of submit to exit the input, even if the input isn't valid (defaults to true) */
    allowSubmitExitOnError?: boolean;
    /** A callback for when the value was submitted, and UI was closed (note that invalid inputs aren't submitted, defaults to a function that updates the input field)*/
    onSubmit?: (value: T) => void;
};

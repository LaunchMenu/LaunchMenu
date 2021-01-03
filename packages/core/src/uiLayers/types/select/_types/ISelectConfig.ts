import {ReactElement} from "react";
import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {IPrioritizedMenuConfig} from "../../../../menus/menu/_types/IPrioritizedMenuConfig";
import {IThemeIcon} from "../../../../styling/theming/_types/IBaseTheme";
import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {IInputError} from "../../input/_types/IInputError";
import {ISelectOption} from "./ISelectOption";

export type ISelectConfig<T> = {
    /** The options for the dropdown */
    options: ISelectOption<T>[];
    /** A method to retrieve the UI for an option */
    createOptionView: (value: T, isDisabled: boolean) => IMenuItem;
    /** A check whether two values are equal, used to highlight the currently selected option */
    equals?: (a: T, b: T) => boolean;
    /** Menu category configuration for the search results */
    categoryConfig?: IPrioritizedMenuConfig;
    /** The item to use for custom input */
    customView?: IMenuItem;
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
    /** Whether to allow usage of submit to exit the input, even if the input isn't valid (defaults to false) */
    allowSubmitExitOnError?: boolean;
    /** A callback for when the value was submitted, and UI was closed (note that invalid inputs aren't submitted, defaults to a function that updates the input field)*/
    onSubmit?: (value: T) => void;
    /** Whether to allow custom user inputs (certain config fields are ignored if disabled, defaults to false) */
    allowCustomInput?: boolean;
};

import {IInputFieldError} from "./IInputFieldError";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IIOContext} from "../../context/_types/IIOContext";

/**
 * A config object for input fields
 */
export type IInputFieldConfig<T> = {
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputFieldError | undefined;
    /** The function to transform the field value into a string */
    toString: T extends string ? undefined | ((v: T) => string) : (v: T) => string;
    /** The function to transform the input string to a valid field value (if the input is valid) */
    fromString: T extends string ? undefined | ((v: string) => T) : (v: string) => T;
    /** Whether to only update on any valid input, or only when the input field (defaults to true)*/
    liveUpdate?: boolean;
    /** The function to call in order to open the menu with the error message */
    openMenu?: (menu: IMenu, context: IIOContext) => () => void;
};

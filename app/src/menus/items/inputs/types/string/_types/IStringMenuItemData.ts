import {IInputFieldError} from "../../../../../../textFields/types/inputField/_types/IInputFieldError";
import {IActionBinding} from "../../../../../actions/_types/IActionBinding";

/** The input data to create a string menu item */
export type IStringMenuItemData = {
    /** The default value for the field */
    default: string;
    /** The name of the field */
    name: string;
    /** The description of the menu item */
    description?: string;
    /** The tags for the menu item */
    tags?: string[];
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputFieldError | undefined;
    /** The extra action bindings */
    actionBindings?: IActionBinding<any>[];
};

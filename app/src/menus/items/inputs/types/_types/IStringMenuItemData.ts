import {IInputFieldError} from "../../../../../textFields/types/inputField/_types/IInputFieldError";
import {IActionBinding} from "../../../../actions/_types/IActionBinding";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a string menu item */
export type IStringMenuItemData = {
    /** The default value for the field */
    init: string;
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputFieldError | undefined;
} & IInputTypeMenuItemData;

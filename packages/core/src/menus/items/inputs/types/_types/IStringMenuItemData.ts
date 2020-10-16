import {IInputError} from "../../../../../uiLayers/types/input/_types/IInputError";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a string menu item */
export type IStringMenuItemData = {
    /** The default value for the field */
    init: string;
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputError | undefined;
} & IInputTypeMenuItemData;

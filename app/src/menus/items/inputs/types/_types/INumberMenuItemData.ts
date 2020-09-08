import {INumberConstraints} from "../../handlers/number/_types/INumberConstraints";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a string menu item */
export type INumberMenuItemData = {
    /** The default value for the field */
    init: number;
    /** Whether to update the field as you type, defaults to false */
    options?: number[];
    /** The numeric options to choose from */
    allowCustomInput?: boolean;
} & INumberConstraints &
    IInputTypeMenuItemData;

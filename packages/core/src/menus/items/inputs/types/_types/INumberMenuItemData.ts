import {INumberConstraints} from "../../handlers/number/_types/INumberConstraints";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a string menu item */
export type INumberMenuItemData = {
    /** The default value for the field */
    init: number;
    /** The numeric options to choose from */
    options?: number[];
    /** Whether to allow custom input when options are present, defaults to false */
    allowCustomInput?: boolean;
} & INumberConstraints &
    IInputTypeMenuItemData;

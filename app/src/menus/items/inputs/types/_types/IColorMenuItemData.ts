import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a color menu item */
export type IColorMenuItemData = {
    /** The default value for the field */
    init: string;
} & IInputTypeMenuItemData;

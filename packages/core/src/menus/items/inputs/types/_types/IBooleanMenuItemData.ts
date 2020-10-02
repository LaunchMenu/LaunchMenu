import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a boolean menu item */
export type IBooleanMenuItemData = {
    /** The default value for the field */
    init: boolean;
} & IInputTypeMenuItemData;

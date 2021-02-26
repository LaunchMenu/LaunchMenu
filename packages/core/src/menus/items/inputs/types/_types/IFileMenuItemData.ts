import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a file menu item */
export type IFileMenuItemData = {
    /** The default value for the field */
    init: string;
    /** Whether to select a folder (or a file) */
    folder?: boolean;
} & IInputTypeMenuItemData;

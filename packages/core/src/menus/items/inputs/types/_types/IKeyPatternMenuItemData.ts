import {KeyPattern} from "../../../../../keyHandler/KeyPattern";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a pattern menu item */
export type IKeyPatternMenuItemData = {
    /** The default value for the field */
    init: KeyPattern;
} & IInputTypeMenuItemData;

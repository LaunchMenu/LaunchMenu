import {IMenuItem} from "../../../_types/IMenuItem";
import {IInputTypeMenuItemData} from "./IInputTypeMenuItemData";

/** The input data to create a boolean menu item */
export type IOptionMenuItemData<T> = {
    /** The default value for the field */
    init: T;
    /** The options of the field */
    options: readonly T[];
    /** Retrieves the element to show as the currently selected item */
    getValueView?: (option: T) => JSX.Element;
    /** Creates a menu item for a given option */
    createOptionView: (option: T) => IMenuItem;
} & IInputTypeMenuItemData;

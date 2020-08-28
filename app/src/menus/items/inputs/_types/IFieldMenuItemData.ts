import {IStandardMenuItemData} from "../../_types/IStandardMenuItemData";

/** The input data to create a field menu item */
export type IFieldMenuItemData<T> = {
    /** The default value */
    default: T;

    /** Retrieves the view of the value */
    valueView: (v: T) => JSX.Element;
} & IStandardMenuItemData;

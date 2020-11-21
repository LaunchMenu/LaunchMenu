import {IStandardMenuItemData} from "../../_types/IStandardMenuItemData";
import {IField} from "../../../../_types/IField";

/** The input data to create a field menu item */
export type IFieldMenuItemData<T> = {
    /** The initial value */
    init: IField<T> | T;
    /** Retrieves the config data */
    data: (
        field: IField<T>
    ) => {
        /** The view of the value */
        valueView: JSX.Element;
        /** Whether the field should be resetable to the initial value, defaults to false */
        resetable?: boolean;
        /** Whether the reset should be undoable, defaults to false */
        resetUndoable?: boolean;
    } & IStandardMenuItemData;
};

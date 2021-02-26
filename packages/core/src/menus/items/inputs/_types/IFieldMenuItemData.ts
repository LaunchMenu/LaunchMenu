import {IStandardMenuItemData} from "../../_types/IStandardMenuItemData";
import {IField} from "../../../../_types/IField";
import {IJSON} from "../../../../_types/IJSON";
import {ISerializableField} from "../../../../settings/_types/ISerializableField";
import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";

/** The input data to create a field menu item */
export type IFieldMenuItemData<T, D extends IJSON> = (
    | {
          /** The field to store data in */
          field: ISerializableField<T, D>;
      }
    | {
          /** The initial value */
          init: T extends IJSON ? ISubscribable<T> : never;
      }
) & {
    /** The initial value */
    init?: ISubscribable<T>;
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

import {IField} from "../../../../_types/IField";

/**
 * Data to be used to reset a field
 */
export type IResetFieldActionData<T> = {
    /** The value to reset the field to */
    default: T | (() => T);
    /** The field to reset the value of */
    field: IField<T>;
    /** Whether the reseting should be undoable, defaults to false */
    undoable?: boolean;
};

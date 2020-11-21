import {IDataHook} from "model-react";

/**
 * An interface for the serializable part of a field
 */
export type ISerializeField<T> = {
    /**
     * Sets the serialized value of the field
     * @param value The value to be set
     */
    setSerialized(value: T): void;

    /**
     * Retrieves the serialized data of the field
     * @param hook The hook to subscribe to changes
     * @returns The current field value
     */
    getSerialized(hook?: IDataHook): T;
};

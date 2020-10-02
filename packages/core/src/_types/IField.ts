import {IDataHook} from "model-react";

/**
 * An interface for fields
 */
export type IField<T> = {
    /**
     * Sets the value of the field
     * @param value The value to be set
     */
    set(value: T): void;

    /**
     * Retrieves the data of the field
     * @param hook The hook to subscribe to changes
     * @returns The current field value
     */
    get(hook?: IDataHook): T;
};

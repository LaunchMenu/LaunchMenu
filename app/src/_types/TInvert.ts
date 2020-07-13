import {TKeyFromValue} from "./TKeyFromValue";

// src: https://stackoverflow.com/a/57726844/8521718
/**
 * Inverts the given object (swapping key and values)
 */
export type TInvert<T extends Record<PropertyKey, PropertyKey>> = {
    [V in T[keyof T]]: TKeyFromValue<V, T>;
};

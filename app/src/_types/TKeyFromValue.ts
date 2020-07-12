// src: https://stackoverflow.com/a/57726844/8521718
/**
 * Extracts the key given a value and the object it's in
 */
export type TKeyFromValue<V, T extends Record<PropertyKey, PropertyKey>> = {
    [K in keyof T]: V extends T[K] ? K : never;
}[keyof T];

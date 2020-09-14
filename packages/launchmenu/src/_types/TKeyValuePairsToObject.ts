/**
 * Retrieves the object representation from a union of key-value pairs
 */
export type TKeyValuePairsToObject<T extends [string, any]> = {
    [P in T[0]]: Extract<T, [P, any]>[1];
};

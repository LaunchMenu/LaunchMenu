/**
 * Specifies that all properties are optional, recursively
 */
export type TDeepPartial<T> = {
    [P in keyof T]?: TDeepPartial<T[P]>;
};

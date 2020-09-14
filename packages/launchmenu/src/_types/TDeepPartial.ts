/**
 * Specifies that all properties are optional, recursively
 */
export type TDeepPartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? TDeepPartial<U>[]
        : T[P] extends object
        ? TDeepPartial<T[P]>
        : T[P];
};

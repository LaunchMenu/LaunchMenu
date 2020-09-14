// src: https://medium.com/@flut1/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca
type NonObjectKeysOf<T> = {
    [K in keyof T]: T[K] extends Array<any> | Function // Added exclusion of Function
        ? K
        : T[K] extends object
        ? never
        : K;
}[keyof T];

type ValuesOf<T> = T[keyof T];
type ObjectValuesOf<T extends Object> = Exclude<
    Exclude<Exclude<Extract<ValuesOf<T>, object>, never>, Function>, // Added exclusion of Function
    Array<any>
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

/**
 * Flattens an object structure by 1 level
 */
export type TFlatten<T> = Pick<T, NonObjectKeysOf<T>> &
    UnionToIntersection<ObjectValuesOf<T>>;

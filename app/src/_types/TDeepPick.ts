import {IRecursiveKeys} from "./IRecursiveKeys";

/**
 * Picks a subset of fields from an object, including recursion
 */
export type TDeepPick<D, P extends IRecursiveKeys<D>> = P extends true
    ? D
    : {[K in keyof P & keyof D]: TDeepPick<D[K], P[K]>};

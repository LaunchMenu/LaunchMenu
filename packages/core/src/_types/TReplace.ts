/**
 * Replaces all props in S by props of the same name in T
 */
export type TReplace<S, T> = Omit<S, keyof T> & T;

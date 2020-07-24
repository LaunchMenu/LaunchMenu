/**
 * A type that deep merges two objects together
 */
export type TDeepMerge<A, B> = B extends object
    ? A extends object
        ? {[K in Exclude<keyof A, keyof B>]: A[K]} &
              {[K in Exclude<keyof B, keyof A>]: B[K]} &
              {[K in keyof A & keyof B]: TDeepMerge<A[K], B[K]>}
        : B
    : B;

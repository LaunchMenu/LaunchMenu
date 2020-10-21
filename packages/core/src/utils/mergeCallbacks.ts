/**
 * Merges a number of callbacks together
 * @param callbacks The list of callbacks to be merged
 * @returns The resulting callback that calls all callbacks
 */
export function mergeCallbacks<A extends Array<any>>(
    callbacks: (((...args: A) => void) | undefined)[]
): (...args: A) => void {
    return mergeCallbacksOptional(callbacks) || (() => {});
}

/**
 * Merges a number of callbacks together, possibly returning undefined if no callbacks were supplied
 * @param callbacks The list of callbacks to be merged
 * @returns The resulting callback that calls all callbacks, which returns the result of the last passed cb
 */
export function mergeCallbacksOptional<A extends Array<any>, B>(
    callbacks: (((...args: A) => B) | undefined)[]
): undefined | ((...args: A) => B) {
    return callbacks.reduce(
        (cur: undefined | ((...args: A) => B), cb: (...args: A) => B) =>
            cb
                ? cur
                    ? (...data) => {
                          cur(...data);
                          return cb(...data);
                      }
                    : cb
                : cur,
        undefined
    );
}

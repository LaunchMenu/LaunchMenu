/**
 * A function that can be used to create constant values without the risk of recursive import issues
 * @param init The function to create the constant
 */
export function constGetter<T>(init: () => T): () => T {
    let ref: T;
    return () => {
        if (!ref) ref = init();
        return ref;
    };
}

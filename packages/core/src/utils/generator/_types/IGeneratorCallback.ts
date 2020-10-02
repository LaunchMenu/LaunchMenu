export type IGeneratorCallback<T> =
    /**
     * A callback to pass items that were generated
     * @param item The generated item
     * @returns A promise that resolves once the next item should be retrieved, when the last item to be retrieved is passed, the promise will return true (last requested item)
     */
    (item: T) => Promise<boolean>;

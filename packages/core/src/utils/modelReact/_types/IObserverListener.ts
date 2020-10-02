/**
 * A listener for model observers
 */
export type IObserverListener<T> =
    /**
     * Listens for data changes in the model
     * @param data The main data provided by the model
     * @param meta The meta data of the getter
     * @param previous The previous value provided by the model (it may not be reliable if initCall=true)
     */
    (
        data: T,
        meta: {readonly isLoading: boolean; readonly exceptions: readonly any[]},
        previous: T
    ) => void;

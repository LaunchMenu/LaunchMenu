import {useState, useEffect, useRef} from "react";
import {IDataLoadRequest, IDataListener} from "model-react";

/**
 * Retrieves a hook that can be used to listen to data from data sources,
 * such that the component rerenders upon data changes.
 * It also returns a function to determine whether the data is still loading, or has errored.
 * @param options  Configuration options
 * @returns The data hook followed by contextual data
 */
export const useDataHook = ({
    forceRefreshTime,
    debounce = 0,
    onChange,
}: {
    /** The time such that if data is older, it will be refreshed */
    forceRefreshTime?: number;
    /** The number of milliseconds to debounce updates, -1 to forward changes synchronously, defaults to 0 */
    debounce?: number;
    /** Code to call when a data update occurred */
    onChange?: () => void;
} = {}): [
    IDataListener & IDataLoadRequest,
    {
        /** Retrieves whether any obtained data is currently loading */
        isLoading: () => boolean;
        /** Retrieves the exceptions that may have occurred while loading */
        getExceptions: () => any[];
    }
] => {
    // A fake state in order to fore an update
    const [, _update] = useState({});
    const update = () => {
        onChange?.();
        _update({});
    };
    const updateTimeout = useRef(undefined as undefined | number);

    // A variable to track whether any retrieved data is refreshing, and exceptions
    let isRefreshing: boolean = false;
    let exceptions: any[] = [];

    // A list of functions to call to remove the passed listener as a dependency
    const dependencyRemovers = useRef([] as (() => void)[]);

    // Remove all dependencies when the element is removed or rerendered
    const removeDependencies = () => {
        dependencyRemovers.current.forEach(remove => remove());
        dependencyRemovers.current = [];
    };
    removeDependencies();
    useEffect(() => removeDependencies, []);
    return [
        // Return the listener which will force an update, and registers whether any data is refreshing
        {
            // Data listener fields
            call() {
                if (debounce == -1) update();
                else if (!updateTimeout.current)
                    updateTimeout.current = setTimeout(() => {
                        updateTimeout.current = undefined;
                        update();
                    }, debounce) as any;
            },
            registerRemover(remover: () => void) {
                dependencyRemovers.current.push(remover);
            },

            // Data loading fields
            refreshData: true,
            markIsLoading() {
                isRefreshing = true;
            },
            registerException(exception: any) {
                exceptions.push(exception);
            },
            ...(forceRefreshTime !== undefined && {refreshTimestamp: forceRefreshTime}),
        },
        // Return the function that retrieves if any data is refreshing
        {isLoading: () => isRefreshing, getExceptions: () => exceptions},
    ];
};

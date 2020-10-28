import {IDataHook} from "model-react";

/**
 * Creates a data hook that can be used for a single time callback
 * @param callback The callback to be triggered
 * @param forceRefreshTime  The time such that if data is older, it will be refreshed
 * @returns The created data hook, and a function to destroy it before it gets fired
 */
export function createCallbackHook(
    callback: () => void,
    forceRefreshTime?: number
): [IDataHook, () => void] {
    let hookListenerRemovers = [] as (() => void)[];
    const remove = () => {
        hookListenerRemovers.forEach(remover => remover());
        hookListenerRemovers = [];
    };
    return [
        {
            call: () => {
                remove();
                callback();
            },
            registerRemover: (remover: () => void) => {
                hookListenerRemovers.push(remover);
            },
            refreshData: forceRefreshTime !== undefined,
            ...(forceRefreshTime !== undefined && {refreshTimestamp: forceRefreshTime}),
        },
        remove,
    ];
}

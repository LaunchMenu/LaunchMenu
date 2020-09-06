import {IDataHook} from "model-react";

/**
 * Creates a data hook that can be used for a single time callback
 * @param callback The callback to be triggered
 * @param forceRefreshTime  The time such that if data is older, it will be refreshed
 * @returns The created data hook
 */
export function createCallbackHook(
    callback: () => void,
    forceRefreshTime?: number
): IDataHook {
    const hookListenerRemovers = [] as (() => void)[];
    return {
        call: () => {
            hookListenerRemovers.forEach(remover => remover());
            // Setup the listener again, and call all our listeners
        },
        registerRemover: (remover: () => void) => {
            hookListenerRemovers.push(remover);
        },
        refreshData: forceRefreshTime !== undefined,
        ...(forceRefreshTime !== undefined && {refreshTimestamp: forceRefreshTime}),
    };
}

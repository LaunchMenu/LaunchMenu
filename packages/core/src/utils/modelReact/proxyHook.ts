import {IDataHook, IDataListener, IDataLoadRequest} from "model-react";

/**
 * Proxies a data hook
 * @param hook The hook to be proxied
 * @param config The config for stuff to hook in
 * @returns The proxied hook
 */
export function proxyHook(
    hook: IDataHook | undefined,
    config: {onCall: () => void}
): IDataHook {
    const h = hook as (IDataListener & IDataLoadRequest) | undefined;
    return {
        call: () => {
            config.onCall();
            h?.call();
        },
        registerRemover: remove => {
            h?.registerRemover(remove);
        },
        refreshData: h?.refreshData ?? false,
        markIsLoading: h?.markIsLoading,
        refreshTimestamp: h?.refreshTimestamp,
        registerException: h?.registerException,
    };
}

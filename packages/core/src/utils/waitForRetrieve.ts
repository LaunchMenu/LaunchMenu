import {IDataHook, waitFor} from "model-react";

/**
 * Waits for a given value to become available, listening for updates using data hooks
 * @param get The getter to retrieve a value
 * @returns The obtained value
 */
export async function waitForRetrieve<T>(
    get: (hook: IDataHook) => T | undefined
): Promise<T> {
    let result: T | undefined;
    await waitFor(hook => {
        result = get(hook);
        return result != undefined;
    });
    return result as T;
}

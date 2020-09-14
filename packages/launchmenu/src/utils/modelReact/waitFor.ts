import {IDataHook, getAsync} from "model-react";

/**
 * Waits for a condition to become true
 * @param getter The getter to get the condition result from
 * @returns A promise that resolves once the condition is met
 */
export async function waitFor(getter: (hook: IDataHook) => boolean): Promise<void> {
    await getAsync(h => {
        if (!getter(h)) h.markIsLoading?.();
    });
}

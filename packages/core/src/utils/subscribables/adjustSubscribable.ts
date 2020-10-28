import {IDataHook} from "model-react";
import {ISubscribable} from "./_types/ISubscribable";

/**
 * Adjusts the given subscribable using the passed function
 * @param data The data to be augmented, either plain data, of subscribable data
 * @param extendData The function to transform the data
 * @returns The new subscribable data
 */
export function adjustSubscribable<T>(
    data: ISubscribable<T>,
    extendData: (bindings: T, hook: IDataHook) => T
): ISubscribable<T> {
    return (hook: IDataHook) =>
        extendData(data instanceof Function ? data(hook) : data, hook);
}

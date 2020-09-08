import {IDataHook} from "model-react";
import {INonFunction} from "../../_types/INonFunction";
import {ISubscribable} from "./_types/ISubscribable";

/**
 * Retrieves the value of a property that is either a data retriever, or just data
 * @param f The function or data to retrieve
 * @param h The hook to retrieve the data with
 * @returns The retrieved data
 */
export function getHooked<T extends INonFunction>(f: ISubscribable<T>, h?: IDataHook): T {
    return f instanceof Function ? f(h) : f;
}

import {Field, IDataHook} from "model-react";

export const createSimpleResultMap = <I>() => {
    const results = new Field([] as I[]);
    return {
        onRemove: (item: I) => {
            const current = results.get(null);
            const index = current.indexOf(item);
            results.set([...current.slice(0, index), ...current.slice(index + 1)]);
        },
        onAdd: (item: I) => {
            results.set([...results.get(null), item]);
        },
        getItems: (hook: IDataHook = null) => s(results.get(hook)),
    };
};

/** Sorts the list, such that order is meaningless (which it should be) */
export const s = (list: any[]) => list.sort();

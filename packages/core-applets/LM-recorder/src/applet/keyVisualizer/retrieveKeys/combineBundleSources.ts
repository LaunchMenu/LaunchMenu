import {DataCacher, IDataRetriever} from "model-react";
import {IKeyBundle} from "./_types/IKeyBundle";

/**
 * Combines two data sources of key bundles to only display the latest data
 * @param sourceA The first source of keys to use
 * @param sourceB The second source of keys to use
 * @returns The combined data source
 */
export function combineBundleSources(
    sourceA: IDataRetriever<IKeyBundle>,
    sourceB: IDataRetriever<IKeyBundle>
): IDataRetriever<IKeyBundle> {
    const cache = new DataCacher<{result: IKeyBundle; wasA: boolean}>((h, prev) => {
        const curA = sourceA(h);
        const curB = sourceB(h);

        const newA = {result: {...curA, ID: `A${curA.ID}`}, wasA: true};
        const newB = {result: {...curB, ID: `A${curB.ID}`}, wasA: false};

        if (prev) {
            if (curA.keys.length && !curB.keys.length) return newA;
            if (curB.keys.length && !curA.keys.length) return newB;
            return prev.wasA ? newA : newB;
        }

        return curA.keys.length > curB.keys.length ? newA : newB;
    });
    return h => cache.get(h).result;
}

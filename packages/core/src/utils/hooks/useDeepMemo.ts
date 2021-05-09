import {useMemo, useRef} from "react";
import {ExtendedObject} from "../ExtendedObject";

/**
 * Behaves the same as useMemo, except only updates when values are deeply different instead of shallowly
 * @param getVal The function to retrieve the value
 * @param dependencies The dependencies
 * @param depth The depth to which to check equality
 * @returns The memoed value
 */
export const useDeepMemo = <T>(getVal: () => T, deps: any[], depth: number = 1): T => {
    const count = useRef(0);
    const prevDeps = useRef(deps);
    if (!ExtendedObject.deepEquals(deps, prevDeps.current, depth + 1)) count.current++;

    prevDeps.current = deps;

    return useMemo(getVal, [count.current]);
};

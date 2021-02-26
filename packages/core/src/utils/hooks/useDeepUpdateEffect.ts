import {useEffect, useRef} from "react";
import {ExtendedObject} from "../ExtendedObject";

/**
 * Performs the given effect only on component updates, when the dependencies aren't deeply equal, not on the first render
 * @param effect Imperative function that can return a cleanup function
 * @param deps Effect will only activate if the values in the list change
 * @param depth The depth to which to check equality
 */
export const useDeepUpdateEffect = (
    effect: () => void | (() => void | undefined),
    deps: ReadonlyArray<any>,
    depth: number = 1
) => {
    const count = useRef(0);
    const prevDeps = useRef(deps);
    if (!ExtendedObject.deepEquals(deps, prevDeps.current, depth + 1)) count.current++;

    prevDeps.current = deps;

    useEffect(effect, [count.current]);
};

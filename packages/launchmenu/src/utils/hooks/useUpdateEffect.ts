import {useEffect, useRef} from "react";

/**
 * Performs the given effect only on component updates, not on the first render
 * @param effect — Imperative function that can return a cleanup function
 * @param deps — If present, effect will only activate if the values in the list change.
 */
export const useUpdateEffect = (
    effect: () => void | (() => void | undefined),
    deps?: ReadonlyArray<any>
) => {
    const first = useRef(true);
    useEffect(() => {
        if (first.current) first.current = false;
        else return effect();
    }, deps);
};

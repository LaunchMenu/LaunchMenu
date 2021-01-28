import {useRef, useEffect, useCallback} from "react";
import {useSmoothScroll} from "./useSmoothScroll";

/**
 * A hook that can be used to control vertical scroll position of an element using smooth scrolling
 * @param scrollDuration How long it takes to scroll to the next click (transition)
 * @returns A ref to pass to the container
 */
export function useVerticalScroll<T extends HTMLElement = HTMLElement>(
    scrollDuration: number = 200
) {
    const elRef = useRef<T | null>(null);
    const [scrollRef, scrollTo] = useSmoothScroll();
    const setRef = useCallback((el: T | null) => {
        scrollRef(el);
        elRef.current = el;
    }, []);

    useEffect(() => {
        const el = elRef.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY == 0) return;
                e.preventDefault();
                scrollTo({addTop: e.deltaY}, scrollDuration);
            };
            el.addEventListener("wheel", onWheel);
            return () => el.removeEventListener("wheel", onWheel);
        }
    }, []);
    return setRef;
}

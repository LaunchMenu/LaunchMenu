import {useRef, useCallback} from "react";
import {TransitionBezier} from "../TransitionBezier";

/** Information used for the current scroll transition target */
type Target = {
    start: {
        left: number;
        top: number;
    };
    end: {
        left: number;
        top: number;
    };
    curve: TransitionBezier;
    time: {
        start: number;
        end: number;
    };
    resolve: (canceled: boolean) => void;
};

/**
 * Creates a ref registrar that can be added to an element, and a function that then can be used to scroll said element
 * @returns The ref and scroll functions
 */
export function useSmoothScroll<T extends HTMLElement = HTMLElement>(): [
    /**
     * Registers the element to control
     * @param el The element to control scroll of
     */
    (el: T | null) => void,
    /**
     * Scrolls to the specified position
     * @param newTarget The position that should be scroll to
     * @param duration How long it takes to reach the specified position
     * @returns A promise that resolves when moving to the target stopped, resolves true if move was canceled since a new target was specified, or false if it successfully finished
     */
    (
        newTarget: {left?: number; top?: number; addLeft?: number; addTop?: number},
        duration?: number
    ) => Promise<boolean>
] {
    const elRef = useRef(null as HTMLElement | null);
    const setRef = useCallback((el: T | null) => (elRef.current = el), []); // Ref setter to help with intellisense issues (compared to passing a ref)
    const animating = useRef(false);

    const targetPoint = useRef(null as null | Target);

    const updateTarget = useCallback(
        (
            newTarget: {left?: number; top?: number; addLeft?: number; addTop?: number},
            duration: number = 500,
            ease: number = 0.5
        ) => {
            const el = elRef.current;
            if (el) {
                // Make a promise to track finish of the animation
                let resolve: (canceled: boolean) => void = () => {};
                const promise = new Promise<boolean>(res => (resolve = res));

                // Create the transition curve and base data object
                const now = Date.now();
                let oldTarget = targetPoint.current;
                let curve: TransitionBezier;
                if (oldTarget) {
                    oldTarget.resolve(true);
                    curve = oldTarget.curve.branch(now, {
                        start: now,
                        duration,
                        outEase: ease,
                    });
                } else {
                    curve = new TransitionBezier({
                        start: now,
                        duration,
                        inEase: ease,
                        outEase: ease,
                    });
                }

                const target = {
                    start: {
                        left: el.scrollLeft,
                        top: el.scrollTop,
                    },
                    end: {
                        left: oldTarget?.end.left ?? el.scrollLeft,
                        top: oldTarget?.end.top ?? el.scrollTop,
                    },
                    curve,
                    time: {
                        start: now,
                        end: now + duration,
                    },
                    resolve,
                };

                // Update the target pos using the arguments
                if (newTarget.addLeft !== undefined)
                    newTarget.left =
                        (oldTarget?.end.left ?? el.scrollLeft) + newTarget.addLeft;
                if (newTarget.addTop !== undefined)
                    newTarget.top =
                        (oldTarget?.end.top ?? el.scrollTop) + newTarget.addTop;
                if (newTarget.left !== undefined)
                    target.end.left = Math.min(
                        Math.max(0, newTarget.left),
                        el.scrollWidth - el.clientWidth
                    );
                if (newTarget.top !== undefined)
                    target.end.top = Math.min(
                        Math.max(0, newTarget.top),
                        el.scrollHeight - el.clientHeight
                    );

                // Make sure there is movement to animate (otherwise we just drag out a transition)
                if (
                    target.end.left == oldTarget?.end.left &&
                    target.end.top == oldTarget?.end.top
                )
                    return Promise.resolve(false);
                targetPoint.current = target;

                // Start an animation if not running already
                if (!animating.current) {
                    animating.current = true;

                    // Create an animation update function
                    const move = () => {
                        // Make sure there is a valid target
                        const target = targetPoint.current;
                        if (!target) {
                            animating.current = false;
                            return;
                        }

                        // Update the position
                        const now = Date.now();
                        const per = target.curve.get(now);

                        el.scrollLeft =
                            (target.end.left - target.start.left) * per +
                            target.start.left;
                        el.scrollTop =
                            (target.end.top - target.start.top) * per + target.start.top;

                        // Check whether transition finished
                        const finished = now > target.time.end;
                        if (finished) {
                            animating.current = false;
                            target.resolve(false);
                            targetPoint.current = null;
                            return;
                        } else requestAnimationFrame(move);
                    };

                    //Start the animation
                    requestAnimationFrame(move);
                }
                return promise;
            }
            return Promise.resolve(false);
        },
        []
    );

    // Return the el ref and scroll function
    return [setRef, updateTarget];
}

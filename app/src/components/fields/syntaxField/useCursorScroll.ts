import {useSmoothScroll} from "../../../utils/hooks/useSmoothScroll";
import {useRef, useCallback} from "react";

/**
 * Scrolls the element that the returned ref is applied to such that the given start of the selection range remains in view
 * @param scrollCursorPadding The padding to apply, such that there is at least this number of pixels visible on either side of the cursor
 * @param getPixelSelection A potential pixel selection listener to forward the data passed to the returned selection setter to
 * @returns An array containing the element ref, as well as the function to call when the pixel selection changed
 */
export function useCursorScroll(
    scrollCursorPadding: number,
    getPixelSelection?: (pixelSelection?: {start: number; end?: number}) => void
) {
    const [scrollRef, setScroll] = useSmoothScroll();
    const boxRef = useRef<HTMLDivElement>();
    const onPixelSelectionChange = useCallback(
        (pixelSelection?: {start: number; end?: number}) => {
            const el = boxRef.current;
            if (el && pixelSelection) {
                const {width} = el.getBoundingClientRect();

                const getScrollSpeed = delta => (Math.abs(delta) > 100 ? 300 : 10);
                const scrollLeft = el.scrollLeft;
                const cursorLeft = pixelSelection.start - scrollCursorPadding;
                const cursorRight = pixelSelection.start + scrollCursorPadding;
                if (scrollLeft > cursorLeft) {
                    setScroll(
                        {left: cursorLeft},
                        getScrollSpeed(cursorLeft - scrollLeft)
                    );
                } else if (el.scrollLeft + width < cursorRight) {
                    setScroll(
                        {left: cursorRight - width},
                        getScrollSpeed(cursorRight - width - scrollLeft)
                    );
                }
                getPixelSelection?.(pixelSelection);
            }
        },
        []
    );

    return [[scrollRef, boxRef], onPixelSelectionChange] as const;
}

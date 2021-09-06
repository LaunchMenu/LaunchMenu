import {useEffect, useRef} from "react";

/**
 * A hook that updates the font size of a given element, such that it fits in its parent
 * @returns The container element ref, followed by the resize element ref
 */
export function useFontFitter() {
    const htmlRef = useRef<HTMLElement>(null);
    const boxRef = useRef<HTMLElement>(null);
    const fontSize = htmlRef.current?.style.fontSize ?? "";
    useEffect(() => {
        const htmlEl = htmlRef.current;
        const boxEl = boxRef.current;
        if (htmlEl && boxEl) {
            htmlEl.style.fontSize = "";
            const cs = window.getComputedStyle(htmlEl);
            let startSize = parseFloat(cs.fontSize);
            htmlEl.style.fontSize = startSize + "px";

            let htmlRect = htmlEl.getBoundingClientRect();
            const boxRect = boxEl.getBoundingClientRect();
            if (htmlRect.width > boxRect.width) {
                const precision = 6;

                // Find the initial minimal scale such that everything is certainly visible
                do {
                    startSize /= 4;
                    htmlEl.style.fontSize = startSize + "px";
                    htmlRect = htmlEl.getBoundingClientRect();
                } while (htmlRect.width > boxRect.width);

                // Zoom in again using a binary search to find the perfect scale
                let size = startSize + startSize / 2; // Go to the midpoint of the range
                startSize /= 2;
                for (let i = 0; i < precision; i++) {
                    htmlEl.style.fontSize = size + "px";
                    htmlRect = htmlEl.getBoundingClientRect();
                    startSize /= 2;
                    size += startSize * (htmlRect.width > boxRect.width ? -1 : 1);
                }
            }
        }
    }, [
        htmlRef.current?.getBoundingClientRect().width,
        boxRef.current?.getBoundingClientRect().width,
    ]);
    if (htmlRef.current) htmlRef.current.style.fontSize = fontSize;

    return [boxRef, htmlRef];
}

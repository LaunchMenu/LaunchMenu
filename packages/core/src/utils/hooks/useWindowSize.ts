import {useEffect, useState} from "react";

/**
 * Retrieves the size of the window.
 * @returns The window size
 */
export function useWindowSize(): {width: number; height: number} {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const changeWindowSize = () =>
            setWindowSize({width: window.innerWidth, height: window.innerHeight});
        window.addEventListener("resize", changeWindowSize);
        return () => {
            window.removeEventListener("resize", changeWindowSize);
        };
    }, []);

    return windowSize;
}

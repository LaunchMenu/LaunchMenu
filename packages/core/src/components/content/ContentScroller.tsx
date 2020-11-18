import React, {FC, useCallback, useEffect, useRef} from "react";
import {IContent} from "../../content/_types/IContent";
import {Box} from "../../styling/box/Box";
import {useSmoothScroll} from "../../utils/hooks/useSmoothScroll";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {FillBox} from "../FillBox";

/**
 * An element that takes care of scrolling the content properly
 */
export const ContentScroller: FC<{content: IContent}> = ({content, children}) => {
    const scrollHeightRef = useRef(0);

    // Sets the content size on every render, TODO: actively listen for size changes in content
    const setRef = (ref: HTMLDivElement) => {
        if (!ref) return;
        const scrollheight = Math.max(0, ref.scrollHeight - ref.clientHeight);
        content.setScrollHeight(scrollheight);
        scrollHeightRef.current = scrollheight;
    };

    // Listen to any offset changes, and auto scroll to show them
    const [h] = useDataHook();
    const offset = content.getScrollOffset(scrollHeightRef.current, h);
    const [scrollRef, setScroll] = useSmoothScroll();
    useEffect(() => {
        setScroll({top: offset});
    }, [offset]);

    // Render a simple box element
    return (
        <FillBox elRef={[setRef, scrollRef]} overflow="auto">
            {children}
        </FillBox>
    );
};

import {useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useRef} from "react";
import {IContent} from "../../content/_types/IContent";
import {IBoxProps} from "../../styling/box/_types/IBoxProps";
import {useSmoothScroll} from "../../utils/hooks/useSmoothScroll";
import {useVerticalScroll} from "../../utils/hooks/useVerticalScroll";
import {FillBox} from "../FillBox";

/**
 * An element that takes care of scrolling the content properly
 */
export const ContentScroller: FC<{content: IContent} & IBoxProps> = ({
    content,
    children,
    ...rest
}) => {
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

    // Enable smooth scrolling
    const smoothScrollRef = useVerticalScroll();

    // Render a simple box element
    return (
        <FillBox elRef={[setRef, scrollRef, smoothScrollRef]} overflow="auto" {...rest}>
            {children}
        </FillBox>
    );
};

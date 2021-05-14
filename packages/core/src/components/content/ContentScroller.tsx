import {useDataHook} from "model-react";
import React, {FC, useEffect, useRef, useState} from "react";
import {useResizeDetector} from "react-resize-detector";
import {IContent} from "../../content/_types/IContent";
import {IBoxProps} from "../../styling/box/_types/IBoxProps";
import {useForceUpdate} from "../../utils/hooks/useForceUpdate";
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
    // Define some functionality to update the size
    const scrollHeightRef = useRef(0);
    const forceUpdate = useForceUpdate();
    const updateSize = () => {
        const ref = resizeRef.current;
        if (!ref) return;
        const scrollHeight = Math.max(0, ref.scrollHeight - ref.clientHeight);
        content.setScrollHeight(scrollHeight);
        const changed = scrollHeightRef.current != scrollHeight;
        scrollHeightRef.current = scrollHeight;
        if (changed) forceUpdate();
    };

    // Update the size on initial mount
    useEffect(updateSize, []);

    // Listen for reasizes
    const {ref: resizeRef} = useResizeDetector({onResize: updateSize});

    // Listen to any offset changes, and auto scroll to show them
    const [h] = useDataHook();
    // console.log(scrollHeightRef.current);
    const offset = content.getScrollOffset(scrollHeightRef.current, h);
    const [scrollRef, setScroll] = useSmoothScroll();
    useEffect(() => {
        setScroll({top: offset});
    }, [offset]);

    // Enable smooth scrolling
    const smoothScrollRef = useVerticalScroll();

    // Render a simple box element
    return (
        <FillBox
            elRef={[scrollRef, smoothScrollRef, resizeRef]}
            overflow="auto"
            {...rest}>
            {children}
        </FillBox>
    );
};

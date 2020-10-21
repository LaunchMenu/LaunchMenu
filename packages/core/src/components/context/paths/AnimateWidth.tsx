import React, {CSSProperties, FC, useLayoutEffect, useRef, useState} from "react";
import {Box} from "../../../styling/box/Box";
import {IBoxProps} from "../../../styling/box/_types/IBoxProps";
import {mergeStyles} from "../../../utils/mergeStyles";

/**
 * A react component that can animate between any 2 possible css widths including auto
 */
export const AnimateWidth: FC<{
    /** The current css width of the element */
    width: CSSProperties["width"];
    /** The initial width of the element */
    initialWidth?: number;
    /** The transition duration */
    duration?: number;
    /** Any additional props to put on the container element */
    containerProps?: IBoxProps;
    /** Any additional props to put on the inner element */
    innerProps?: IBoxProps;
}> = ({initialWidth, width, children, duration = 250, containerProps, innerProps}) => {
    const elRef = useRef<HTMLDivElement>();
    const [currentWidth, setCurrentWidth] = useState(
        initialWidth != undefined ? initialWidth : "auto"
    );
    useLayoutEffect(() => {
        if (elRef.current) {
            const elWidth = elRef.current.getBoundingClientRect().width;
            setCurrentWidth(elWidth);
        }
    }, [width]);

    return (
        <Box
            display="inline-block"
            width={currentWidth}
            overflow="hidden"
            {...containerProps}
            css={mergeStyles({transition: `width ${duration}ms`}, containerProps?.css)}>
            <Box
                display="inline-block"
                width={width}
                whiteSpace="nowrap"
                elRef={elRef}
                {...innerProps}>
                {children}
            </Box>
        </Box>
    );
};

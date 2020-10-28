import React, {useEffect, useState, FC, useCallback, useRef, isValidElement} from "react";
import {Box} from "../../../../../styling/box/Box";
import {ISlideChangeTransitionProps} from "./_types/ISlideChangeTransitionProps";
import {FillBox} from "../../../../FillBox";

/**
 * A simple sliding transition
 */
export const SlideChangeTransition: FC<ISlideChangeTransitionProps> = ({
    onComplete,
    children,
    duration = 150,
    direction = "right",
    activate = true,
}) => {
    const [started, setStarted] = useState(false);
    const transitionEl = useRef<HTMLElement>();
    useEffect(() => {
        // Force reflow in order to not skip animation: https://stackoverflow.com/a/45431539/8521718
        transitionEl.current?.getBoundingClientRect();
        setStarted(activate);
    }, [activate]);
    const _onComplete = useCallback((e: React.TransitionEvent) => {
        if (e.target != transitionEl.current) return;
        onComplete?.();
        e.stopPropagation();
    }, []);

    const dirProp = {
        left: "left",
        right: "right",
        up: "top",
        down: "bottom",
    }[direction];
    const flexDirProp = ({
        left: "row",
        right: "row-reverse",
        up: "column",
        down: "column-reverse",
    } as const)[direction];

    return (
        <FillBox display="flex" overflow="hidden">
            <Box
                display="flex"
                elRef={transitionEl}
                flexDirection={flexDirProp}
                onTransitionEnd={_onComplete}
                style={{
                    minWidth: "100%",
                    minHeight: "100%",
                    transition: `${dirProp} ${duration}ms linear`,
                    [dirProp]: started ? `-${100 * (children.length - 1)}%` : 0,
                    position: "relative",
                }}>
                {children.map((child, i) => (
                    <Box
                        css={{
                            minWidth: "100%",
                            minHeight: "100%",
                            maxWidth: "100%",
                            maxHeight: "100%",
                        }}
                        key={(isValidElement(child) && child.key) || i}
                        position="relative">
                        {child}
                    </Box>
                ))}
            </Box>
        </FillBox>
    );
};

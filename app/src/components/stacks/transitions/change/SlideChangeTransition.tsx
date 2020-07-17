import React, {useEffect, useState, FC, useCallback, useRef} from "react";
import {Box} from "../../../../styling/box/Box";
import {ISlideChangeTransitionProps} from "./_types/ISlideChangeTransitionProps";
import {v4 as uuid} from "uuid";

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
        <Box
            display="flex"
            overflow="hidden"
            position="absolute"
            left={0}
            right={0}
            top={0}
            bottom={0}>
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
                        key={i}
                        position="relative">
                        {child}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

import React, {useEffect, useState, FC, useCallback, useRef} from "react";
import {Box} from "../../../../styling/box/Box";
import {ISlideCloseTransitionProps} from "./_types/ISlideCloseTransition";

/**
 * A simple sliding transition
 */
export const SlideCloseTransition: FC<ISlideCloseTransitionProps> = ({
    onComplete,
    children,
    duration = 500,
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
        e.preventDefault();
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
                css={{
                    minWidth: "100%",
                    minHeight: "100%",
                    transition: started ? `${dirProp} ${duration}ms linear` : "",
                    [dirProp]: started ? `-100%` : 0,
                    position: "relative",
                }}>
                <Box
                    css={{
                        minWidth: "100%",
                        minHeight: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                    }}
                    position="relative">
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

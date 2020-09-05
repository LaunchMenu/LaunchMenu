import React, {FC, useLayoutEffect, useRef, useState} from "react";
import {StackView} from "../../components/stacks/StackView";
import {Box} from "../../styling/box/Box";
import {usePaneIsVisible} from "../hooks/usePaneIsVisible";
import {IApplicationLayoutProps} from "./_types/IApplicationLayoutProps";

/**
 * A component to make up the application layout and handle opening an closing of panes
 */
export const ApplicationLayout: FC<IApplicationLayoutProps> = ({
    contentStack,
    fieldStack,
    menuStack,
    menuWidthFraction = 0.4,
    fieldHeight = 60,
    defaultTransitionDuration = 150,
}) => {
    const fieldState = usePaneIsVisible(fieldStack, defaultTransitionDuration);
    const menuState = usePaneIsVisible(menuStack, defaultTransitionDuration);
    const contentState = usePaneIsVisible(contentStack, defaultTransitionDuration);

    // Combine the menu and content states
    const bottomDivisionState = useRef({
        leftOpen: true,
        rightOpen: true,
        duration: defaultTransitionDuration,
    }).current;
    const bottomSectionState = useRef({
        open: true,
        animating: false,
        duration: defaultTransitionDuration,
    }).current;
    if (
        menuState.open != menuState.prevOpen ||
        contentState.open != contentState.prevOpen
    ) {
        const bothClosed = !menuState.open && !contentState.open;
        if (bothClosed) {
            // If both left and right are closed, close the whole bottom
            bottomSectionState.open = false;
            // Copy the appropriate duration
            bottomSectionState.duration = menuState.prevOpen
                ? menuState.duration
                : contentState.duration;
        } else {
            const changeDuration =
                menuState.prevOpen != menuState.open
                    ? menuState.duration
                    : contentState.duration;
            // Update the left and right open states
            bottomDivisionState.leftOpen = menuState.open;
            bottomDivisionState.rightOpen = contentState.open;
            bottomDivisionState.duration = changeDuration;

            // Open the bottom section if it isn't already
            if (!bottomSectionState.open) {
                bottomSectionState.open = true;
                bottomSectionState.duration = changeDuration;

                // If the bottom section is about to open (and isn't still closing) instantly open the left and or right section
                if (!bottomSectionState.animating) bottomDivisionState.duration = 0;
            }
        }
    }

    // Obtain the layout size for animation calculations
    const layoutRef = useRef<HTMLElement>();
    const [size, setSize] = useState({width: 0, height: 0});
    useLayoutEffect(() => {
        if (layoutRef.current) setSize(layoutRef.current.getBoundingClientRect());
    }, [layoutRef.current]);

    // Return the layout with transition animations
    const horizontalDivision =
        (bottomDivisionState.leftOpen
            ? bottomDivisionState.rightOpen
                ? menuWidthFraction
                : 1
            : 0) * size.width;
    return (
        <Box elRef={layoutRef} display="flex" flexDirection="column" height="100%">
            <Box
                position="relative"
                height={fieldState.open ? fieldHeight : 0}
                transition={`${fieldState.duration}ms height`}>
                <StackView stack={fieldStack} />
            </Box>
            <Box
                position="relative"
                overflow="hidden"
                flexGrow={bottomSectionState.open ? 1 : 0}
                transition={`${bottomSectionState.duration}ms flex-grow`}>
                <Box
                    position="absolute"
                    bottom="none"
                    height="100%"
                    minHeight={size.height - fieldHeight}
                    display="flex">
                    <Box
                        position="relative"
                        flexShrink={0}
                        onAnimationStart={() => (bottomSectionState.animating = true)}
                        onAnimationEnd={() => (bottomSectionState.animating = false)}
                        transition={`${bottomDivisionState.duration}ms width`}
                        width={horizontalDivision}>
                        <Box
                            minWidth={size.width * menuWidthFraction}
                            width="100%"
                            height="100%"
                            right="none"
                            position="absolute">
                            <StackView stack={menuStack} />
                        </Box>
                    </Box>
                    <Box position="relative" flexGrow={1} flexShrink={1}>
                        <Box width={size.width * (1 - menuWidthFraction)} height="100%">
                            <StackView stack={contentStack} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

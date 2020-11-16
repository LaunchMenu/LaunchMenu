import {IDataHook} from "model-react";
import React, {useLayoutEffect, useRef, useState} from "react";
import {UIPathView} from "../../components/context/paths/UIPathView";
import {StackView} from "../../components/context/stacks/StackView";
import {InstantChangeTransition} from "../../components/context/stacks/transitions/change/InstantChangeTransition";
import {SlideDownChangeTransition} from "../../components/context/stacks/transitions/change/slideChange/slideChangeDirectionts";
import {
    SlideRightCloseTransition,
    SlideUpCloseTransition,
} from "../../components/context/stacks/transitions/close/slideClose/slideCloseDirections";
import {
    SlideLeftOpenTransition,
    SlideDownOpenTransition,
} from "../../components/context/stacks/transitions/open/slideOpen/slideOpenDirectionts";
import {IOContextProvider} from "../../context/react/IOContextContext";
import {getContextContentStack} from "../../context/uiExtracters/getContextContentStack";
import {getContextFieldStack} from "../../context/uiExtracters/getContextFieldStack";
import {getContextMenuStack} from "../../context/uiExtracters/getContextMenuStack";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";
import {usePaneIsVisible} from "../hooks/usePaneIsVisible";
import {IApplicationLayoutProps} from "./_types/IApplicationLayoutProps";

/**
 * A component to make up the application layout and handle opening an closing of panes
 */
export const ApplicationLayout: LFC<IApplicationLayoutProps> = ({
    context,
    menuWidthFraction = 0.4,
    fieldHeight = 60,
    defaultTransitionDuration = 150,
}) => {
    const fieldStackGetter = (h?: IDataHook) => getContextFieldStack(context, h);
    const fieldState = usePaneIsVisible(fieldStackGetter, defaultTransitionDuration);
    const menuStackGetter = (h?: IDataHook) => getContextMenuStack(context, h);
    const menuState = usePaneIsVisible(menuStackGetter, defaultTransitionDuration);
    const contentStackGetter = (h?: IDataHook) => getContextContentStack(context, h);
    const contentState = usePaneIsVisible(contentStackGetter, defaultTransitionDuration);

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
    const [animating, setAnimating] = useState(false); // Skip animating on first render
    const layoutRef = useRef<HTMLElement>();
    const [size, setSize] = useState({width: 0, height: 0});
    useLayoutEffect(() => {
        if (layoutRef.current) setSize(layoutRef.current.getBoundingClientRect());
        setTimeout(() => setAnimating(true));
    }, [layoutRef.current]);

    // Return the layout with transition animations
    const horizontalDivision =
        (bottomDivisionState.leftOpen
            ? bottomDivisionState.rightOpen
                ? menuWidthFraction
                : 1
            : 0) * size.width;
    return (
        <IOContextProvider value={context}>
            <Box
                elRef={layoutRef}
                display="flex"
                flexDirection="column"
                height="100%"
                borderRadius="normal"
                overflow="hidden">
                <Box
                    position="relative"
                    elevation="medium"
                    zIndex={100}
                    height={fieldState.open ? fieldHeight : 0}
                    transition={`${fieldState.duration}ms height`}>
                    <StackView
                        OpenTransitionComp={SlideDownOpenTransition}
                        ChangeTransitionComp={SlideDownChangeTransition}
                        CloseTransitionComp={SlideUpCloseTransition}
                        stackGetter={fieldStackGetter}
                    />
                </Box>
                <Box>
                    <UIPathView
                        context={context}
                        pathTransitionDuration={defaultTransitionDuration}
                        heightTransitionDuration={defaultTransitionDuration}
                    />
                </Box>
                <Box
                    position="relative"
                    overflow="hidden"
                    flexGrow={bottomSectionState.open ? 1 : 0}
                    transition={
                        animating
                            ? `${bottomSectionState.duration}ms flex-grow`
                            : undefined
                    }>
                    <Box
                        position="absolute"
                        bottom="none"
                        height="100%"
                        // minHeight={size.height - fieldHeight}
                        display="flex">
                        <Box
                            position="relative"
                            background="bgTertiary"
                            flexShrink={0}
                            onAnimationStart={() => (bottomSectionState.animating = true)}
                            onAnimationEnd={() => (bottomSectionState.animating = false)}
                            transition={
                                animating
                                    ? `${bottomDivisionState.duration}ms width`
                                    : undefined
                            }
                            width={horizontalDivision}>
                            <Box
                                minWidth={size.width * menuWidthFraction}
                                width="100%"
                                height="100%"
                                right="none"
                                position="absolute">
                                <StackView
                                    OpenTransitionComp={SlideLeftOpenTransition}
                                    CloseTransitionComp={SlideRightCloseTransition}
                                    stackGetter={menuStackGetter}
                                />
                            </Box>
                        </Box>
                        <Box
                            position="relative"
                            flexGrow={1}
                            flexShrink={1}
                            background="bgSecondary">
                            <Box
                                width={size.width * (1 - menuWidthFraction)}
                                height="100%">
                                <StackView
                                    ChangeTransitionComp={InstantChangeTransition}
                                    stackGetter={contentStackGetter}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </IOContextProvider>
    );
};

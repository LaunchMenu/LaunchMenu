import React, {FC, ReactNode} from "react";
import {Box, FillBox, IBoxProps, mergeStyles} from "@launchmenu/core";
import {IOverlayProps, IOverlayJSONProps} from "./_types/IOverlayProps";
import {createRemoteElementShower} from "./createRemoteElementShower";

/** A standard overlay container */
export const Overlay: FC<IOverlayProps> = ({
    children,
    innerProps,
    shadow = "0px 0px 12px rgba(0,0,0,0.2)",
    backgroundOpacity = 0.8,
    borderRadius = "medium",
    background = "bgTertiary",
    blur = 2,
    containerChildren,
    backgroundProps,
    ...rest
}) => (
    <Box
        zIndex={1}
        overflow="hidden"
        position="absolute"
        padding="medium"
        borderRadius={borderRadius}
        boxSizing="content-box"
        {...rest}
        css={mergeStyles(
            {
                fontSize: 25,
                filter: `drop-shadow(${shadow})`,
                backdropFilter: blur ? `blur(${blur}px)` : undefined,
            },
            rest.css
        )}>
        <FillBox
            background={background}
            opacity={backgroundOpacity}
            zIndex={0}
            borderRadius={borderRadius}
            {...backgroundProps}
        />
        {containerChildren}
        <Box position="relative" zIndex={1} {...innerProps}>
            {children}
        </Box>
    </Box>
);

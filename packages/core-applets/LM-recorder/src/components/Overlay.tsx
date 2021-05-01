import React, {FC} from "react";
import {Box, FillBox, IBoxProps, mergeStyles} from "@launchmenu/core";

/** A standard overlay container */
export const Overlay: FC<
    IBoxProps & {backgroundOpacity?: number; blur?: number; innerProps?: IBoxProps}
> = ({
    children,
    innerProps,
    backgroundOpacity = 0.7,
    borderRadius = "medium",
    background = "bgTertiary",
    blur = 2,
    ...rest
}) => (
    <Box
        zIndex={1}
        overflow="hidden"
        position="absolute"
        borderRadius={borderRadius}
        {...rest}
        css={mergeStyles(
            {
                boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.5)",
                backdropFilter: blur ? `blur(${blur}px)` : undefined,
            },
            rest.css
        )}>
        <FillBox background={background} opacity={backgroundOpacity} zIndex={0} />
        <Box position="relative" zIndex={1} {...innerProps}>
            {children}
        </Box>
    </Box>
);

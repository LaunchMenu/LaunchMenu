import React, {FC} from "react";
import {Box, IBoxProps, mergeStyles} from "@launchmenu/core";

/** An elements that blinks the contents of this div */
export const Blink: FC<
    IBoxProps & {blinkDuration?: number; minOpacity?: number; maxOpacity?: number}
> = ({css, blinkDuration = 1500, minOpacity = 0.5, maxOpacity = 1, ...props}) => (
    <Box
        {...props}
        css={mergeStyles(
            {
                "@keyframes blink": {
                    "0%": {opacity: maxOpacity},
                    "50%": {opacity: minOpacity},
                    "100%": {opacity: maxOpacity},
                },
                animation: `blink normal ${blinkDuration}ms infinite ease-in-out`,
            },
            css
        )}
    />
);

import React from "react";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";
import {keyframes} from "@emotion/react";

const spinnerKeyframes = keyframes({
    "0%": {transform: "rotate(0deg)"},
    "100%": {transform: "rotate(360deg)"},
});

/** A standard spinner element for loading */
export const Spinner: LFC<{size?: number}> = ({size = 25}) => (
    <Box
        css={theme => ({
            border: `${Math.floor(size / 5)}px solid ${theme.color.bgTertiary}`,
            borderTop: `${Math.floor(size / 5)}px solid ${theme.color.primary}`,
            borderRadius: "50%",
            width: size,
            height: size,
            animation: `${spinnerKeyframes} 2s linear infinite`,
        })}
    />
);

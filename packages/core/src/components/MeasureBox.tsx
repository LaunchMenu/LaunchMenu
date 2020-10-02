import {IBoxProps} from "../styling/box/_types/IBoxProps";
import React, {FC} from "react";
import {Box} from "../styling/box/Box";

/**
 * A box that is not visible and can be used for measuring content sizes
 */
export const MeasureBox: FC<IBoxProps> = props => (
    <Box
        className="measureBox"
        visibility="hidden"
        display="inline-block"
        position="absolute"
        whiteSpace="pre"
        zIndex={-1}
        {...props}
    />
);

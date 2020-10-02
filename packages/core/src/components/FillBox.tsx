import {FC} from "react";
import {IBoxProps} from "../styling/box/_types/IBoxProps";
import {Box} from "../styling/box/Box";
import React from "react";

/**
 * A box that has absolute positioning and fills its parent
 */
export const FillBox: FC<IBoxProps> = props => (
    <Box
        position="absolute"
        left="none"
        right="none"
        bottom="none"
        top="none"
        {...props}
    />
);

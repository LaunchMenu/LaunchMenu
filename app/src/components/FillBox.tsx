import {FC} from "react";
import {IBoxProps} from "../styling/box/_types/IBoxProps";
import {Box} from "../styling/box/Box";
import React from "react";

/**
 * A box that has absolute positioning and fills its parent
 */
export const FillBox: FC<IBoxProps> = props => (
    <Box position="absolute" left={0} right={0} bottom={0} top={0} {...props} />
);

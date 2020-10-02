import {FC} from "react";
import {IBoxProps} from "../styling/box/_types/IBoxProps";
import {Box} from "../styling/box/Box";
import React from "react";

/**
 * A box that centers its contents
 */
export const CenterBox: FC<IBoxProps & {vertical?: boolean; horizontal?: boolean}> = ({
    vertical = true,
    horizontal = true,
    ...props
}) => (
    <Box
        height={vertical ? "100%" : undefined}
        width={horizontal ? "100%" : undefined}
        display="flex"
        alignItems={vertical ? "center" : undefined}
        justifyContent={horizontal ? "center" : undefined}
        {...props}
    />
);

import React, {FC} from "react";
import {Box} from "../styling/box/Box";

/**
 * An inline component that highlights its content text
 */
export const Highlight: FC<{
    children: string;
    /** Whether to use the secondary highlight color */
    secondaryColor?: boolean;
}> = ({children, secondaryColor}) => (
    <Box
        as="span"
        background={secondaryColor ? "secondary" : "primary"}
        borderRadius="small">
        {children}
    </Box>
);

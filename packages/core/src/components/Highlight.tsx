import React, {FC} from "react";
import {useBackgroundColor} from "../styling/backgroundColorContext";
import {Box} from "../styling/box/Box";

/**
 * An inline component that highlights its content text
 */
export const Highlight: FC<{
    children: string;
}> = ({children}) => {
    const {isDark} = useBackgroundColor();
    return (
        <Box
            as="span"
            background={isDark ? "bgPrimary" : "primary"}
            color={isDark ? "primary" : "fontPrimary"}
            borderRadius="small">
            {children}
        </Box>
    );
};

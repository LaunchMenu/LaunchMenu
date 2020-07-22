import React, {FC} from "react";
import {Box} from "../styling/box/Box";

/**
 * An inline component that highlights its content text
 */
export const Highlight: FC<{children: string}> = ({children}) => (
    <Box as="span" css={{backgroundColor: "green"}} borderRadius={0.5}>
        {children}
    </Box>
);

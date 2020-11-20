import React, {FC} from "react";
import {Box} from "../styling/box/Box";

/**
 * Styling for notes (extra information that should be subtle)
 */
export const Note: FC = ({children}) => (
    <Box font="paragraph" opacity={0.6}>
        {children}
    </Box>
);

import React, {FC} from "react";
import {Box} from "../../../styling/box/Box";

/**
 * A simple error message formatting component
 */
export const ErrorMessage: FC = ({children}) => (
    <Box background="bgPrimary" css={{color: "red"}}>
        {children}
    </Box>
);

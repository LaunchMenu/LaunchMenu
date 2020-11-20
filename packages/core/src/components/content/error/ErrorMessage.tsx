import React, {FC} from "react";
import {Box} from "../../../styling/box/Box";
import {IBoxProps} from "../../../styling/box/_types/IBoxProps";
import {mergeStyles} from "../../../utils/mergeStyles";

/**
 * A simple error message formatting component
 */
export const ErrorMessage: FC<IBoxProps> = ({children, ...rest}) => (
    <Box background="bgPrimary" {...rest} css={mergeStyles({color: "red"}, rest.css)}>
        {children}
    </Box>
);

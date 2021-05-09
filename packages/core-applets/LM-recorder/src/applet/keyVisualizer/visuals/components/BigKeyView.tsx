import React, {FC} from "react";
import {Box} from "@launchmenu/core";

/**
 * A view to represent keys
 */
export const BigKeyView: FC = props => (
    <Box
        backgroundColor="bgSecondary"
        display="inline-block"
        margin="medium"
        elevation="small"
        borderRadius="large"
        css={{
            fontFamily: "consolas",
            lineHeight: 1,
        }}
        {...props}
    />
);

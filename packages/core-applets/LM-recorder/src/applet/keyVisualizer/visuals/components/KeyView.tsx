import React, {FC} from "react";
import {Box} from "@launchmenu/core";

/**
 * A view to represent keys
 */
export const KeyView: FC = props => (
    <Box
        backgroundColor="bgPrimary"
        display="inline-block"
        margin="medium"
        elevation="medium"
        padding="small"
        paddingY="extraSmall"
        borderRadius="medium"
        css={{
            fontFamily: "consolas",
            lineHeight: 1,
        }}
        {...props}
    />
);

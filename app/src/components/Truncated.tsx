import React, {FC} from "react";
import {Box} from "../styling/box/Box";
import {Tooltip} from "@fluentui/react";

/**
 * Truncates text when it overflow the boundaries
 */
export const Truncated: FC<{lines?: number; title?: string}> = ({
    title,
    lines = 1,
    children,
}) => (
    <Box
        title={title}
        css={
            {
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: `${lines}`,
                WebkitBoxOrient: "vertical",
            } as any
        }>
        {children}
    </Box>
);

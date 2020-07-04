import React, {FC, ReactNode} from "react";
import {Box} from "../../../styling/box/Box";

/**
 * The standard layout for menu items, having the icon on the left, and vertically stacked content on the right
 */
export const MenuItemLayout: FC<{icon: ReactNode; content: ReactNode}> = ({
    icon,
    content,
}) => (
    <Box display="flex" padding={1}>
        {icon && <Box width={50}>{icon}</Box>}
        <Box flexGrow={1}>{content}</Box>
    </Box>
);

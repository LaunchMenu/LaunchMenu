import React, {ReactNode} from "react";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";

/**
 * The standard layout for menu items, having the icon on the left, and vertically stacked content on the right
 */
export const MenuItemLayout: LFC<{icon?: ReactNode; content: ReactNode}> = ({
    icon,
    content,
}) => (
    <Box display="flex" padding="medium">
        {icon && (
            <Box minWidth={40} marginRight="medium">
                {icon}
            </Box>
        )}
        <Box flexGrow={1}>{content}</Box>
    </Box>
);

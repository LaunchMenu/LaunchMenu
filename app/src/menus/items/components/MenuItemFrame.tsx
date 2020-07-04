import React, {FC} from "react";
import {Box} from "../../../styling/box/Box";

/**
 * A menu item frame that allows
 */
export const MenuItemFrame: FC<{isSelected: boolean; isCursor: boolean}> = ({
    isCursor,
    isSelected,
    children,
}) => (
    <Box background={isCursor ? "primary" : isSelected ? "secondary" : "neutral5"}>
        {children}
    </Box>
);

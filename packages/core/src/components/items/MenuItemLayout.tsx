import React, {ReactNode} from "react";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";
import {IMenuItemLayoutProps} from "./_types/IMenuItemLayoutProps";

/**
 * The standard layout for menu items, having the icon on the left, and vertically stacked content on the right
 */
export const MenuItemLayout: LFC<IMenuItemLayoutProps> = ({
    name,
    description,
    icon,
    value,
    shortcut,
}) => {
    const main = (
        <Box
            className="itemMain"
            display="flex"
            flexGrow={1}
            padding="medium"
            paddingLeft="none">
            {icon && <Box minWidth={40}>{icon}</Box>}
            <Box flexGrow={1} paddingLeft="medium">
                <Box
                    className="itemFirstLine"
                    display="flex"
                    justifyContent="space-between"
                    flexWrap="wrap">
                    <Box
                        className="itemName"
                        maxWidth="70%"
                        marginRight={value || shortcut ? "medium" : undefined}>
                        {name}
                    </Box>
                    {value ? (
                        <Box className="itemValue" marginLeft="auto">
                            {value}
                        </Box>
                    ) : shortcut ? (
                        <Box className="itemShortcut" marginLeft="auto">
                            {shortcut}
                        </Box>
                    ) : undefined}
                </Box>

                {description && <Box>{description}</Box>}
            </Box>
        </Box>
    );

    // Add the extra data if needed
    if (value && shortcut) {
        return (
            <Box className="itemWrapper">
                <Box
                    className="itemExtra"
                    display="flex"
                    justifyContent="flex-end"
                    padding="medium"
                    paddingBottom="none">
                    <Box className="itemShortcut">{shortcut}</Box>
                </Box>
                {main}
            </Box>
        );
    }
    return main;
};

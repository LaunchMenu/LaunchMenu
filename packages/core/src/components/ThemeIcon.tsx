import React from "react";
import {IThemeIcon} from "../styling/theming/_types/IBaseTheme";
import {useTheme} from "../styling/theming/ThemeContext";
import {LFC} from "../_types/LFC";
import {Box} from "../styling/box/Box";

export const ThemeIcon: LFC<{icon: IThemeIcon; size?: number}> = ({icon, size}) => {
    const theme = useTheme();
    const iconEl = theme.icon[icon] || <></>;
    if (size)
        return (
            <Box
                css={{fontSize: size}}
                display="flex"
                alignItems="center"
                justifyContent="center">
                {iconEl}
            </Box>
        );
    return iconEl;
};

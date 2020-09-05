import React from "react";
import {IThemeIcon} from "../styling/theming/_types/IBaseTheme";
import {useTheme} from "../styling/theming/ThemeContext";
import {LFC} from "../_types/LFC";

export const ThemeIcon: LFC<{icon: IThemeIcon}> = ({icon}) => {
    const theme = useTheme();
    return theme.icon[icon] || <></>;
};

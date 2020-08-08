import React, {FC} from "react";
import {IThemeIcon} from "../styling/theming/_types/IBaseTheme";
import {useTheme} from "../styling/theming/ThemeContext";

export const ThemeIcon: FC<{icon: IThemeIcon}> = ({icon}) => {
    const theme = useTheme();
    return theme.icon[icon] || <></>;
};

import React, {isValidElement} from "react";
import {Box} from "../../styling/box/Box";
import {useTheme} from "../../styling/theming/ThemeContext";
import {IIcons} from "../../styling/theming/_types/IIcons";
import {LFC} from "../../_types/LFC";
import {CenterBox} from "../CenterBox";
import {ThemeIcon} from "../ThemeIcon";

export const MenuItemIcon: LFC<{icon: string | JSX.Element}> = ({icon}) => {
    const theme = useTheme();
    const themeIcon = theme.icon[icon as keyof IIcons] as JSX.Element | undefined;
    const iconElement = isValidElement(icon) ? icon : themeIcon;
    return (
        <Box
            css={{
                backgroundImage: iconElement ? undefined : `url(${icon})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                width: "100%",
                height: "100%",
                fontSize: "25px",
            }}>
            {iconElement && (
                <CenterBox>
                    {themeIcon ? <ThemeIcon icon={icon as keyof IIcons} /> : iconElement}
                </CenterBox>
            )}
        </Box>
    );
};

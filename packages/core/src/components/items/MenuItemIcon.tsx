import React from "react";
import {Box} from "../../styling/box/Box";
import {useTheme} from "../../styling/theming/ThemeContext";
import {IIcons} from "../../styling/theming/_types/IIcons";
import {LFC} from "../../_types/LFC";
import {CenterBox} from "../CenterBox";
import {ThemeIcon} from "../ThemeIcon";

export const MenuItemIcon: LFC<{icon: string}> = ({icon}) => {
    const theme = useTheme();
    const themeIcon = theme.icon[icon as keyof IIcons] as JSX.Element | undefined;
    return (
        <Box
            css={{
                backgroundImage: themeIcon ? undefined : `url(${icon})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                width: "100%",
                height: "100%",
                fontSize: "25px",
            }}>
            {themeIcon && (
                <CenterBox>
                    <ThemeIcon icon={icon as keyof IIcons} />
                </CenterBox>
            )}
        </Box>
    );
};

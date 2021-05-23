import React, {createContext, FC, useContext, useRef} from "react";
import Color from "color";
import {useTheme} from "./theming/ThemeContext";
import {IThemeColor} from "./theming/_types/IBaseTheme";
import {IBackgroundColorData} from "./_types/IBackgroundColorData";

/**
 * A context to pass background color info down the tree, used by menu items, since their bg changes based on selection
 */
export const BackgroundColorContext = createContext<IBackgroundColorData>({
    isHighlight: false,
});

/**
 * A provider for the background color, isDark will automatically be computed if a color is provided
 */
export const BackgroundColorProvider: FC<{isDark?: boolean; color?: string | number}> = ({
    isDark,
    color,
    children,
}) => {
    const valueRef = useRef<IBackgroundColorData>({isHighlight: false});
    const inpRef = useRef<{
        color?: string | number;
        isDark?: boolean;
    }>({});

    const theme = useTheme();

    // Update the data if input changed
    if (inpRef.current.color != color || inpRef.current.isDark != isDark) {
        // If a color is provided calculate the isDark property and check if theme color
        if (color) {
            const isThemeColor =
                typeof color == "string" && !!theme.color[color as IThemeColor];
            const c = isThemeColor ? theme.color[color as IThemeColor] : color;
            if (isDark === undefined) isDark = new Color(c).isDark();
            const isHighlight = isThemeColor
                ? !["bgPrimary", "bgSecondary", "bgTertiary"].includes(
                      color as IThemeColor
                  )
                : isDark != new Color(theme.color.bgPrimary).isDark();

            valueRef.current = {
                isHighlight: isHighlight,
                isDark,
                color: c,
                themeColorName: isThemeColor ? (color as string) : undefined,
            };
        } else {
            // Otherwise just forward the isDark property
            valueRef.current = {isHighlight: isDark || false};
        }

        // Update the input data to later compare for changes
        inpRef.current = {color, isDark};
    }

    return (
        <BackgroundColorContext.Provider value={valueRef.current} children={children} />
    );
};

/**
 * Retrieve color background color data in the current context
 */
export const useBackgroundColor = () => useContext(BackgroundColorContext);

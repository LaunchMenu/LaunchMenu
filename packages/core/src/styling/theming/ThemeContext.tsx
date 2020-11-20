import React, {createContext, FC, ReactNode, useContext} from "react";
import {ITheme} from "./_types/ITheme";
import {defaultTheme} from "./defaultTheme";
import {useDataHook} from "model-react";
import {getTheme} from "./loadTheme";
import {Global} from "@emotion/core";

/**
 * A context for the LaunchMenu theme
 */
export const ThemeContext = createContext(defaultTheme as ITheme);

/**
 * Retrieves the theme for the application
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * The provider for the theme context
 */
export const ThemeProvider: FC<{theme?: ITheme; children: ReactNode}> = ({
    theme,
    children,
}) => {
    const [h] = useDataHook();
    if (!theme) theme = getTheme(h);
    return (
        <ThemeContext.Provider value={theme}>
            <Global<ITheme>
                styles={
                    (theme.globalCss instanceof Function
                        ? theme.globalCss(theme)
                        : theme.globalCss) || {}
                }
            />
            {children}
        </ThemeContext.Provider>
    );
};

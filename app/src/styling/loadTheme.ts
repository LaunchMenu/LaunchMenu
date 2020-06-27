import {loadTheme as fluentLoadTheme} from "@fluentui/react";
import {ITheme} from "./_types/ITheme";
import {convertThemeToFluentTheme} from "./themeToFluentTheme";

/**
 * Loads the given theme
 * @param theme The LaunchMenu theme to use
 */
export function loadTheme(theme: ITheme) {
    const fluentTheme = convertThemeToFluentTheme(theme);
    fluentLoadTheme(fluentTheme);
}

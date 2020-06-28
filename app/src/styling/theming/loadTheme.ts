import {loadTheme as fluentLoadTheme, initializeIcons} from "@fluentui/react";
import {ITheme} from "./_types/ITheme";
import {convertThemeToFluentTheme} from "./themeToFluentTheme";
import {defaultTheme} from "./defaultTheme";
import {Field, IDataHook} from "model-react";

let selectedTheme = new Field(defaultTheme);

/**
 * Retrieves the globally loaded theme
 * @param hook The hook to subscribe to changes
 * @returns The loaded theme
 */
export function getTheme(hook?: IDataHook): ITheme {
    return selectedTheme.get(hook || null);
}

/**
 * Loads the given theme
 * @param theme The LaunchMenu theme to use
 */
export function loadTheme(theme: ITheme): void {
    const fluentTheme = convertThemeToFluentTheme(theme);
    fluentLoadTheme(fluentTheme);
    initializeIcons();
    selectedTheme.set(theme);
}

import {ITheme} from "./_types/ITheme";
import {defaultTheme} from "./defaultTheme";
import {Field, IDataHook} from "model-react";

let selectedTheme = new Field(defaultTheme);

/**
 * Retrieves the globally loaded theme
 * @param hook The hook to subscribe to changes
 * @returns The loaded theme
 */
export function getTheme(hook?: IDataHook): ITheme {
    return selectedTheme.get(hook);
}

/**
 * Loads the given theme
 * @param theme The LaunchMenu theme to use
 */
export function loadTheme(theme: ITheme): void {
    selectedTheme.set(theme);
}

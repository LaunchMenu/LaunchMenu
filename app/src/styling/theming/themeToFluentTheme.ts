import {ITheme} from "./_types/ITheme";
import {createTheme as createFluentTheme, ITheme as IFluentTheme} from "@fluentui/react";

/**
 * Creates a fluent theme given the LM theme
 * @param theme The LaunchMenu theme
 * @returns The fluent theme
 */
export function convertThemeToFluentTheme(theme: ITheme): IFluentTheme {
    return createFluentTheme({
        palette: theme.compatibility.colors,
        spacing: {
            s1: `${theme.spacing(1)}px`,
            s2: `${theme.spacing(2)}px`,
            m: `${theme.spacing(3)}px`,
            l1: `${theme.spacing(4)}px`,
            l2: `${theme.spacing(5)}px`,
        },
    });
}

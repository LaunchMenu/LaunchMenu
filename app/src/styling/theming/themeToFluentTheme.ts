import {ITheme} from "./_types/ITheme";
import {createTheme as createFluentTheme, ITheme as IFluentTheme} from "@fluentui/react";

/**
 * Creates a fluent theme given the LM theme
 * @param theme The LaunchMenu theme
 * @returns The fluent theme
 */
export function convertThemeToFluentTheme(theme: ITheme): IFluentTheme {
    return createFluentTheme({
        palette: {
            themeDarker: theme.colors.primaryDark,
            themeDark: theme.colors.primaryDark,
            themeDarkAlt: theme.colors.primary,
            themePrimary: theme.colors.primaryLight,
            themeSecondary: theme.colors.secondaryDark,
            themeTertiary: theme.colors.secondaryDark,
            themeLight: theme.colors.secondary,
            themeLighter: theme.colors.secondaryLight,
            themeLighterAlt: theme.colors.secondaryLight,
            neutralLighterAlt: theme.colors.neutral9,
            neutralLighter: theme.colors.neutral9,
            neutralLight: theme.colors.neutral8,
            neutralQuaternaryAlt: theme.colors.neutral7,
            neutralQuaternary: theme.colors.neutral6,
            neutralTertiaryAlt: theme.colors.neutral5,
            neutralTertiary: theme.colors.neutral4,
            neutralSecondary: theme.colors.neutral3,
            neutralPrimaryAlt: theme.colors.neutral2,
            neutralPrimary: theme.colors.neutral1,
            neutralDark: theme.colors.neutral0,
            white: theme.colors.white,
            black: theme.colors.black,
        },
        spacing: {
            s1: `${theme.spacing(1)}px`,
            s2: `${theme.spacing(2)}px`,
            m: `${theme.spacing(3)}px`,
            l1: `${theme.spacing(4)}px`,
            l2: `${theme.spacing(5)}px`,
        },
    });
}

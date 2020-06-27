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
            themePrimary: theme.colors.primary,
            themeSecondary: theme.colors.secondary,
            themeTertiary: theme.colors.tertiary,
            themeLight: theme.colors.light,
            themeLighter: theme.colors.lighter,
            themeLighterAlt: theme.colors.lightest,
            themeDark: theme.colors.dark,
            themeDarkAlt: theme.colors.darker,
            themeDarker: theme.colors.darkest,
            neutralLighterAlt: theme.colors.neutral(1),
            neutralLighter: theme.colors.neutral(0.9),
            neutralLight: theme.colors.neutral(0.8),
            neutralQuaternaryAlt: theme.colors.neutral(0.7),
            neutralQuaternary: theme.colors.neutral(0.6),
            neutralTertiaryAlt: theme.colors.neutral(0.5),
            neutralTertiary: theme.colors.neutral(0.4),
            neutralSecondary: theme.colors.neutral(0.3),
            neutralPrimaryAlt: theme.colors.neutral(0.2),
            neutralPrimary: theme.colors.neutral(0.1),
            neutralDark: theme.colors.neutral(0),
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

import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import Color from "color";

/**
 * Creates a new theme from the given input
 * @param themeInput The theme input data
 * @param light Whether to create a light theme
 * @returns The theme
 */
export function createTheme(themeInput: IThemeInput): ITheme {
    return {
        ...themeInput,
        colors: {
            primary: themeInput.colors.accent.primary,
            secondary: themeInput.colors.accent.secondary,
            tertiary: themeInput.colors.accent.tertiary,
            bgPrimary: themeInput.colors.background.primary,
            bgSecondary: themeInput.colors.background.secondary,
            bgTertiary: themeInput.colors.background.tertiary,

            fontPrimary: themeInput.colors.font.accent,
            fontSecondary: themeInput.colors.font.accent,
            fontTertiary: themeInput.colors.font.accent,
            fontBgPrimary: themeInput.colors.font.background,
            fontBgSecondary: themeInput.colors.font.background,
            fontBgTertiary: themeInput.colors.font.background,
        },
        compatibility: {
            colors: {
                themeDarker: new Color(themeInput.colors.accent.tertiary)
                    .darken(0.05)
                    .hex(),
                themeDark: themeInput.colors.accent.tertiary,
                themeDarkAlt: themeInput.colors.accent.secondary,
                themePrimary: themeInput.colors.accent.primary,
                themeSecondary: new Color(themeInput.colors.accent.primary)
                    .lighten(0.05)
                    .hex(),
                themeTertiary: new Color(themeInput.colors.accent.primary)
                    .lighten(0.1)
                    .hex(),
                themeLight: new Color(themeInput.colors.accent.primary)
                    .lighten(0.15)
                    .hex(),
                themeLighter: new Color(themeInput.colors.accent.primary)
                    .lighten(0.2)
                    .hex(),
                themeLighterAlt: new Color(themeInput.colors.accent.primary)
                    .lighten(0.25)
                    .hex(),

                white: themeInput.colors.background.primary,
                neutralLighterAlt: new Color(themeInput.colors.accent.primary)
                    .mix(new Color(themeInput.colors.background.secondary), 0.5)
                    .hex(),
                neutralLighter: themeInput.colors.background.secondary,
                neutralLight: themeInput.colors.background.tertiary,
                neutralQuaternaryAlt: new Color(themeInput.colors.background.tertiary)
                    .darken(0.1)
                    .hex(),
                neutralTertiaryAlt: new Color(themeInput.colors.background.tertiary)
                    .darken(0.2)
                    .hex(),
                neutralTertiary: new Color(themeInput.colors.background.tertiary)
                    .darken(0.3)
                    .hex(),
                neutralSecondary: new Color(themeInput.colors.background.tertiary)
                    .darken(0.4)
                    .hex(),
                neutralPrimaryAlt: new Color(themeInput.colors.background.tertiary)
                    .darken(0.5)
                    .hex(),
                neutralPrimary: new Color(themeInput.colors.background.tertiary)
                    .darken(0.6)
                    .hex(),
                neutralDark: new Color(themeInput.colors.background.tertiary)
                    .darken(0.7)
                    .hex(),
                black: new Color(themeInput.colors.background.tertiary).darken(0.8).hex(),
            },
        },
        spacing: multiple => themeInput.spacingMultiple * multiple,
    };
}

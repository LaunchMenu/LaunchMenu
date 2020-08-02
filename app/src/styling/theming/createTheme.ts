import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import Color from "color";
import {IHighlightThemeInput} from "./highlighting/_types/IHighlightThemeInput";
import {IHighlightTheme} from "./highlighting/_types/IHighlightTheme";
import {createHighlightTheme} from "./highlighting/createHighlightTheme";

/**
 * Creates a new theme from the given input
 * @param themeInput The theme input data
 * @param highlightTheme The highlighting styling
 * @returns The theme
 */
export function createTheme(
    themeInput: IThemeInput,
    highlightTheme: IHighlightThemeInput | IHighlightTheme
): ITheme {
    const theme = {
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
        spacing: multiple => themeInput.spacingMultiple * multiple,
        elevations: {
            extraSmall:
                themeInput.elevations?.extraSmall ||
                "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;",
            small:
                themeInput.elevations?.small ||
                "rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
            medium:
                themeInput.elevations?.medium ||
                "rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 14px 0px;",
            large:
                themeInput.elevations?.large ||
                "rgba(0, 0, 0, 0.2) 0px 8px 9px -5px, rgba(0, 0, 0, 0.14) 0px 15px 22px 2px, rgba(0, 0, 0, 0.12) 0px 5px 26px 4px;",
            extraLarge:
                themeInput.elevations?.extraLarge ||
                "rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 44px 8px;",
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
    };

    return {
        ...theme,
        highlighting: createHighlightTheme(highlightTheme, theme),
    };
}

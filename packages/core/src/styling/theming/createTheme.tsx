import React from "react";
import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import {IHighlightThemeInput} from "./highlighting/_types/IHighlightThemeInput";
import {IHighlightTheme} from "./highlighting/_types/IHighlightTheme";
import {createHighlightTheme} from "./highlighting/createHighlightTheme";
import {IBaseTheme} from "./_types/IBaseTheme";
import {GoSearch} from "react-icons/go";
import Path from "path";
import {
    FiSettings,
    FiMenu,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
} from "react-icons/fi";

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
    const accentFont = themeInput.colors.font.accent;
    const bgFont = themeInput.colors.font.background;

    // Manage font assets and styling
    const fonts = {} as {[key: string]: {name: string; path: string}};
    const getFont = (font?: string) => {
        if (!font)
            font = `url("${Path.join(__dirname, "..", "fonts", "Lato-Light.ttf")}")`;

        font = font.replace(/\\/g, "/");
        if (!fonts[font]) {
            let nameMatch = font.match(/([\w-_]+)([^\w]*|\..*)$/); // Try to extract a name from file path
            let name = (nameMatch && nameMatch[1]) || "font";
            while (Object.values(fonts).find(({name: n}) => n == name)) name += "N";
            fonts[font] = {
                name,
                path: font,
            };
        }
        return fonts[font].name;
    };

    // The overall theme
    const theme: IBaseTheme = {
        ...themeInput,
        color: {
            primary: themeInput.colors.accent.primary,
            secondary: themeInput.colors.accent.secondary,
            tertiary: themeInput.colors.accent.tertiary,
            bgPrimary: themeInput.colors.background.primary,
            bgSecondary: themeInput.colors.background.secondary,
            bgTertiary: themeInput.colors.background.tertiary,

            fontPrimary: accentFont instanceof Object ? accentFont.primary : accentFont,
            fontSecondary:
                accentFont instanceof Object ? accentFont.secondary : accentFont,
            fontTertiary: accentFont instanceof Object ? accentFont.tertiary : accentFont,
            fontBgPrimary: bgFont instanceof Object ? bgFont.primary : bgFont,
            fontBgSecondary: bgFont instanceof Object ? bgFont.secondary : bgFont,
            fontBgTertiary: bgFont instanceof Object ? bgFont.tertiary : bgFont,
        },
        elevation: {
            extraSmall:
                themeInput.elevations?.extraSmall || "0 14px 28px 0px rgba(0,0,0,0.10)",
            small: themeInput.elevations?.small || "0 3px 6px -2px rgba(0,0,0,0.10)",
            medium: themeInput.elevations?.medium || "0 10px 20px -5px rgba(0,0,0,0.10)",
            large: themeInput.elevations?.large || " 0 14px 28px -7px rgba(0,0,0,0.10)",
            extraLarge:
                themeInput.elevations?.extraLarge || "0 19px 38px -10px rgba(0,0,0,0.10)",
        },
        font: {
            textField: {
                fontFamily: getFont(themeInput.fonts?.textField?.fontFamily),
                fontSize: themeInput.fonts?.textField?.fontSize || 24,
                fontStyle: themeInput.fonts?.textField?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.textField?.fontWeight || 200,
                textTransform: themeInput.fonts?.textField?.textTransform || "none",
            },
            header: {
                fontFamily: getFont(themeInput.fonts?.header?.fontFamily),
                fontSize: themeInput.fonts?.header?.fontSize || 18,
                fontStyle: themeInput.fonts?.header?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.header?.fontWeight || 200,
                textTransform: themeInput.fonts?.header?.textTransform || "none",
            },
            headerLarge: {
                fontFamily: getFont(themeInput.fonts?.headerLarge?.fontFamily),
                fontSize: themeInput.fonts?.headerLarge?.fontSize || 24,
                fontStyle: themeInput.fonts?.headerLarge?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.headerLarge?.fontWeight || 200,
                textTransform: themeInput.fonts?.headerLarge?.textTransform || "none",
            },
            paragraph: {
                fontFamily: getFont(themeInput.fonts?.paragraph?.fontFamily),
                fontSize: themeInput.fonts?.paragraph?.fontSize || 14,
                fontStyle: themeInput.fonts?.paragraph?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.paragraph?.fontWeight || 200,
                textTransform: themeInput.fonts?.paragraph?.textTransform || "none",
            },
            bold: {
                fontFamily: getFont(themeInput.fonts?.paragraph?.fontFamily),
                fontSize: themeInput.fonts?.paragraph?.fontSize || 14,
                fontStyle: themeInput.fonts?.paragraph?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.paragraph?.fontWeight || 900,
                textTransform: themeInput.fonts?.paragraph?.textTransform || "none",
            },
        },
        radius: {
            small: themeInput.radius?.small || 4,
            normal: themeInput.radius?.normal || 8,
            large: themeInput.radius?.large || 16,
            round: themeInput.radius?.round || 100000,
        },
        border: {
            normal: themeInput.border?.normal || {
                borderWidth: 1,
            },
            thick: themeInput.border?.thick || {
                borderWidth: 3,
            },
        },
        spacing: {
            none: 0,
            extraSmall: themeInput.spacing?.extraSmall || 2,
            small: themeInput.spacing?.small || 4,
            medium: themeInput.spacing?.medium || 8,
            large: themeInput.spacing?.large || 16,
            extraLarge: themeInput.spacing?.extraLarge || 32,
        },
        icon: {
            search: themeInput.icons?.search || <GoSearch />,
            settings: themeInput.icons?.settings || <FiSettings />,
            menu: themeInput.icons?.menu || <FiMenu />,
            arrowDown: themeInput.icons?.arrowDown || <FiChevronDown />,
            arrowUp: themeInput.icons?.arrowUp || <FiChevronUp />,
            arrowLeft: themeInput.icons?.arrowLeft || <FiChevronLeft />,
            arrowRight: themeInput.icons?.arrowRight || <FiChevronRight />,
        },
        globalCss: {
            "@font-face": Object.values(fonts).map(({name, path}) => ({
                fontFamily: name,
                src: path,
            })),
        },
    };

    return {
        ...theme,
        highlighting: createHighlightTheme(highlightTheme, theme),
    };
}

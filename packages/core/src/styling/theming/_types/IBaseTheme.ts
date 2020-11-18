import {ITypography} from "./ITypography";
import {IIcons} from "./IIcons";
import {IBorder} from "./IBorder";
import {Interpolation} from "@emotion/core";

/**
 * The base properties of a theme
 */
export type IBaseTheme = {
    color: {
        primary: string;
        secondary: string;
        tertiary: string;

        bgPrimary: string;
        bgSecondary: string;
        bgTertiary: string;

        fontPrimary: string;
        fontSecondary: string;
        fontTertiary: string;

        fontBgPrimary: string;
        fontBgSecondary: string;
        fontBgTertiary: string;
    };
    elevation: {
        extraSmall: string;
        small: string;
        medium: string;
        large: string;
        extraLarge: string;
    };
    font: {
        textField: ITypography;
        header: ITypography;
        headerLarge: ITypography;
        paragraph: ITypography;
        bold: ITypography;
    };
    radius: {
        small: number;
        normal: number;
        large: number;
        round: number;
    };
    border: {
        normal: IBorder;
        thick: IBorder;
    };
    spacing: {
        none: 0;
        extraSmall: number;
        small: number;
        medium: number;
        large: number;
        extraLarge: number;
    };
    icon: IIcons;
    globalCss?: Interpolation;
};

/**
 * The theme border options
 */
export type IThemeColor = keyof IBaseTheme["color"];

/**
 * The theme border options
 */
export type IThemeElevation = keyof IBaseTheme["elevation"];

/**
 * The theme font options
 */
export type IThemeFont = keyof IBaseTheme["font"];

/**
 * The theme radius options
 */
export type IThemeRadius = keyof IBaseTheme["radius"];

/**
 * The theme border options
 */
export type IThemeBorder = keyof IBaseTheme["border"];

/**
 * The theme spacing options
 */
export type IThemeSpacing = keyof IBaseTheme["spacing"];

/**
 * The theme icon options
 */
export type IThemeIcon = keyof IBaseTheme["icon"];

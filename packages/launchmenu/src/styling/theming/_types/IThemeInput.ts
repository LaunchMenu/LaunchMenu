import {ITypography} from "./ITypography";
import {IIcons} from "./IIcons";
import {IBorder} from "./IBorder";

export type IThemeInput = {
    colors: {
        accent: {
            primary: string; // light (for light theme)
            secondary: string; // darker (for light theme)
            tertiary: string; // darkest (for light theme)
        };
        background: {
            primary: string; // light (for light theme)
            secondary: string; // darker (for light theme)
            tertiary: string; // darkest (for light theme)
        };
        font: {
            accent:
                | string
                | {
                      primary: string;
                      secondary: string;
                      tertiary: string;
                  };
            background:
                | string
                | {
                      primary: string;
                      secondary: string;
                      tertiary: string;
                  };
        };
    };
    elevations?: {
        extraSmall?: string;
        small?: string;
        medium?: string;
        large?: string;
        extraLarge?: string;
    };
    fonts?: {
        textField?: Partial<ITypography>;
        header?: Partial<ITypography>;
        headerLarge?: Partial<ITypography>;
        paragraph?: Partial<ITypography>;
    };
    radius?: {
        small?: number;
        normal?: number;
        large?: number;
        round?: number;
    };
    border?: {
        normal?: IBorder;
        thick?: IBorder;
    };
    spacing?: {
        extraSmall?: number;
        small?: number;
        medium?: number;
        large?: number;
        extraLarge?: number;
    };
    icons?: Partial<IIcons>;
};

import {IThemeInput} from "./IThemeInput";

export type ITheme = {
    colors: {
        primary: string;
        secondary: string;
        tertiary: string;
        light: string;
        lighter: string;
        lightest: string;
        dark: string;
        darker: string;
        darkest: string;
        neutral: (per: number) => string;
        black: string;
        white: string;
    };
    spacing: (multiple: number) => number;
    icons: {[P in keyof IThemeInput["icons"]]: JSX.Element};
};

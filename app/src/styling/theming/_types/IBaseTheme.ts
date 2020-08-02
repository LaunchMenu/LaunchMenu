export type IBaseTheme = {
    colors: {
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
    elevations: {
        extraSmall: string;
        small: string;
        medium: string;
        large: string;
        extraLarge: string;
    };
    spacing: (multiple: number) => number;
    /** Additional data for compatibility with fluent-ui theming */
    compatibility: {
        colors: {
            themeDarker: string;
            themeDark: string;
            themeDarkAlt: string;
            themePrimary: string;
            themeSecondary: string;
            themeTertiary: string;
            themeLight: string;
            themeLighter: string;
            themeLighterAlt: string;

            black: string;
            neutralDark: string;
            neutralPrimary: string;
            neutralPrimaryAlt: string;
            neutralSecondary: string;
            neutralTertiary: string;
            neutralTertiaryAlt: string;
            neutralQuaternaryAlt: string;
            neutralLight: string;
            neutralLighter: string;
            neutralLighterAlt: string;
            white: string;
        };
    };
};

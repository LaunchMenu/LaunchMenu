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
            accent: string;
            background: string;
        };
    };
    elevations?: {
        extraSmall?: string;
        small?: string;
        medium?: string;
        large?: string;
        extraLarge?: string;
    };
    spacingMultiple: number;
};

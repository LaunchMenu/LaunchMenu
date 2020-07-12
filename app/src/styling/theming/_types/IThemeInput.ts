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
    spacingMultiple: number;
};

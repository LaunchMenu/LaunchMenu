export type IThemeInput = {
    colors: {
        primary: {
            light: string;
            default: string;
            dark: string;
        };
        secondary: {
            light: string;
            default: string;
            dark: string;
        };
        neutral: {
            start: string;
            end: string;
        };
        black: string;
        white: string;
    };
    spacingMultiple: number;
};

import {IIconInput} from "./IIconInput";

export type IThemeInput = {
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
        neutral: {
            start: string;
            end: string;
        };
        black: string;
        white: string;
    };
    spacingMultiple: number;
    icons: {
        Home: IIconInput;
    };
};

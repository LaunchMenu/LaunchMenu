import {createTheme} from "./createTheme";

export const defaultTheme = createTheme({
    colors: {
        accent: {
            primary: "#008DFA",
            secondary: "#0078d4",
            tertiary: "#006BBE",
        },
        background: {
            primary: "#FFFFFF",
            secondary: "#CFCFCF",
            tertiary: "#AFAFAF",
        },
        font: {
            accent: "#FFFFFF",
            background: "#000000",
        },
    },
    spacingMultiple: 8,
});

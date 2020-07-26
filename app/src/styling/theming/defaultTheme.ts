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
            secondary: "#F2F2F2",
            tertiary: "#E5E5E5",
        },
        font: {
            accent: "#FFFFFF",
            background: "#000000",
        },
    },
    spacingMultiple: 8,
});

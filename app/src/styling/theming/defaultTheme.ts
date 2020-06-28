import {createTheme} from "./createTheme";

export const defaultTheme = createTheme({
    colors: {
        primary: {
            light: "#008DFA",
            default: "#0078d4",
            dark: "#006BBE",
        },
        secondary: {
            light: "#8FE2FF",
            default: "#55D3FF",
            dark: "#33CAFF",
        },
        neutral: {
            start: "#201f1e",
            end: "#faf9f8",
        },
        black: "#000000",
        white: "#ffffff",
    },
    spacingMultiple: 8,
});

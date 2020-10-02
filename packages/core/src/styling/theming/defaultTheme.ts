import {createTheme} from "./createTheme";
import {defaultHighlightTheme} from "./highlighting/defaultHighlightTheme";

export const defaultTheme = createTheme(
    {
        colors: {
            accent: {
                primary: "#008DFA",
                secondary: "#0078d4",
                tertiary: "#006BBE",
            },
            background: {
                primary: "#FFFFFF",
                secondary: "#EEEEEE",
                tertiary: "#DDDDDD",
            },
            font: {
                accent: "#FFFFFF",
                background: "#000000",
            },
        },
    },
    defaultHighlightTheme
);

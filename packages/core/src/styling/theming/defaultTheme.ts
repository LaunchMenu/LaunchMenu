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
                secondary: "#FAFAFA",
                tertiary: "#EEEEEE",
            },
            font: {
                accent: "#FFFFFF",
                background: "#000000",
            },
        },
        globalCss: theme => ({
            "&::-webkit-scrollbar": {
                width: 15,
            },
            "&::-webkit-scrollbar-track": {
                background: theme.color.bgTertiary,
            },
            "&::-webkit-scrollbar-thumb": {
                background: theme.color.bgPrimary,
                border: "3px solid",
                borderColor: "transparent",
                backgroundClip: "padding-box",
            },
            "&::-webkit-scrollbar-thumb:hover": {
                background: theme.color.primary,
                border: "3px solid",
                borderColor: "transparent",
                backgroundClip: "padding-box",
            },
        }),
    },
    defaultHighlightTheme
);

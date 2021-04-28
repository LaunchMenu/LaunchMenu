import {createTheme, defaultHighlightTheme} from "@launchmenu/core";

export const testTheme = createTheme(
    {
        colors: {
            accent: {
                primary: "#8DFA00",
                secondary: "#78d400",
                tertiary: "#6BBE00",
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
                borderRadius: 7, // 4p + 3px border
            },
            "&::-webkit-scrollbar-thumb:hover": {
                background: theme.color.primary,
                border: "3px solid",
                borderColor: "transparent",
                backgroundClip: "padding-box",
                borderRadius: 7, // 4p + 3px border
            },
            "*:focus": {
                outline: "none",
            },
        }),
    },
    defaultHighlightTheme
);

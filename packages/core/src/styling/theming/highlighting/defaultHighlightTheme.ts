import {highlightTags} from "../../../textFields/syntax/utils/highlightTags";
import {IHighlightThemeInput} from "./_types/IHighlightThemeInput";

/**
 * A default highlighting theme
 */
export const defaultHighlightTheme: IHighlightThemeInput = theme => ({
    syntax: [
        // Search highlighting
        {
            scope: [[highlightTags.searchHighlight, highlightTags.darkBackground]],
            settings: {
                backgroundColor: theme.color.primary,
                color: theme.color.fontPrimary,
                borderRadius: theme.radius.small,
            },
        },
        {
            scope: [highlightTags.searchHighlight],
            settings: {
                backgroundColor: theme.color.bgPrimary,
                color: theme.color.primary,
                borderRadius: theme.radius.small,
            },
        },

        // Special cases
        {
            scope: [highlightTags.error],
            settings: {
                background: "#ff7777",
            },
        },
        {
            scope: [highlightTags.empty],
            settings: {
                width: 5,
                "::before": {
                    content: "' '",
                },
            },
        },

        // General highlighting
        {
            scope: [highlightTags.number, highlightTags.patternMatch],
            settings: {
                color: theme.color.primary,
            },
        },
        {
            scope: [highlightTags.literal],
            settings: {
                color: theme.color.secondary,
            },
        },
        {
            scope: [highlightTags.operator],
            settings: {
                color: theme.color.tertiary,
            },
        },
    ],
});

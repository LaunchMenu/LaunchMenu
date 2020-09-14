import {highlightTags} from "../../../textFields/syntax/utils/highlightTags";
import {IHighlightThemeInput} from "./_types/IHighlightThemeInput";

/**
 * A default highlighting theme
 */
export const defaultHighlightTheme: IHighlightThemeInput = theme => ({
    syntax: [
        {
            scope: [highlightTags.number, highlightTags.patternMatch],
            settings: {
                color: theme.color.primary,
            },
        },
        {
            scope: [highlightTags.operator],
            settings: {
                color: theme.color.tertiary,
            },
        },
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
    ],
});

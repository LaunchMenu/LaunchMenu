import {tags} from "../../../textFields/syntax/utils/standardTags";
import {IHighlightThemeInput} from "./_types/IHighlightThemeInput";

/**
 * A default highlighting theme
 */
export const defaultHighlightTheme: IHighlightThemeInput = theme => ({
    syntax: [
        {
            scope: [tags.number],
            settings: {
                color: theme.color.primary,
            },
        },
        {
            scope: [tags.operator],
            settings: {
                color: theme.color.tertiary,
            },
        },
        {
            scope: [tags.error],
            settings: {
                background: "#ff7777",
            },
        },
        {
            scope: [tags.empty],
            settings: {
                width: 5,
                "::before": {
                    content: "' '",
                },
            },
        },
    ],
});

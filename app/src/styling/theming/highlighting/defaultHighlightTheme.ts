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
                color: theme.colors.primary,
            },
        },
        {
            scope: [tags.operator],
            settings: {
                color: theme.colors.tertiary,
                padding: 30,
            },
        },
        {
            scope: [tags.error],
            settings: {
                background: "#ff7777",
                padding: 20,
            },
        },
        {
            scope: [tags.empty],
            settings: {
                display: "inline-block",
                width: 5,
                height: "1em",
                verticalAlign: "bottom",
            },
        },
    ],
});

import {IHighlightTheme} from "./_types/IHighlightTheme";
import {IHighlightThemeInput} from "./_types/IHighlightThemeInput";
import {IBaseTheme} from "../_types/IBaseTheme";

/**
 * Creates a new theme from the given input
 * @param highlightTheme The highlighting styling
 * @param baseTheme The base theme to use for the highlighting theme
 * @returns The theme
 */
export function createHighlightTheme(
    highlightTheme: IHighlightThemeInput,
    baseTheme: IBaseTheme
): IHighlightTheme {
    if (highlightTheme instanceof Function) highlightTheme = highlightTheme(baseTheme);

    return {
        ...highlightTheme,
        selection: highlightTheme.selection || {
            background: baseTheme.color.primary,
            opacity: 0.4,
        },
        cursor: highlightTheme.cursor || {
            background: baseTheme.color.fontBgPrimary,
            width: 2,
        },
    };
}

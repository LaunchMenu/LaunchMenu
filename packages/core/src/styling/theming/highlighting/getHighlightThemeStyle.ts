import {CSSObject} from "@emotion/serialize";
import {IHighlightTheme} from "./_types/IHighlightTheme";

/**
 * Retrieves the json css styling for a particular highlight theme
 * @param highlightTheme The highlight theme
 * @returns The css json object
 */
export function getHighlightThemeStyle(highlightTheme: IHighlightTheme): CSSObject {
    const styles = {} as {[key: string]: any};
    highlightTheme.syntax.forEach(style => {
        styles[
            style.scope
                .map(tags => "." + (tags instanceof Array ? tags.join(".") : tags))
                .join(",")
        ] = style.settings;
    });
    return styles;
}

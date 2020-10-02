import {IThemeColor} from "../../../theming/_types/IBaseTheme";
import {ITheme} from "../../../theming/_types/ITheme";
import {createMapper} from "../createMapper/createMapper";

/**
 * Retrieves a given color value from the the theme
 * @param color The color value to retrieve
 * @param theme The theme to retrieve the color from
 * @returns The color value
 */
export function mapColor(color: IThemeColor, theme: ITheme): string {
    return theme.color[color] ?? color;
}

/*
 - true: applies mapping transformation above and stores it under the property with the same name
 - string: applies mapping transformation above and stores it under a property whose name is the specified string
 - function: Stores the returned fields under those names in the result
*/

/**
 * All the mapping functions to map properties to css colors
 */
export const cssColorMappers = createMapper(mapColor, {
    background: (color: IThemeColor, theme: ITheme) => ({
        background: mapColor(color, theme),
        ...(!/^font/.exec(color) && {
            color: mapColor(
                ("font" + color.charAt(0).toUpperCase() + color.slice(1)) as any,
                theme
            ),
        }),
    }),
    backgroundColor: true,
    borderColor: true,
    borderTopColor: true,
    borderRightColor: true,
    borderBottomColor: true,
    borderLeftColor: true,
    caretColor: true,
    color: true,
    columnRuleColor: true,
    outlineColor: true,
    textDecorationColor: true,
});

import {IThemeSpacing} from "../../../theming/_types/IBaseTheme";
import {ITheme} from "../../../theming/_types/ITheme";
import {createMapper} from "../createMapper/createMapper";

/**
 * Retrieves a given spacing value from the the theme
 * @param spacing The spacing value to retrieve
 * @param theme The theme to retrieve the spacing from
 * @returns The spacing value
 */
export function mapSpacing(spacing: IThemeSpacing, theme: ITheme): number {
    return theme.spacing[spacing] ?? spacing;
}

/*
 - true: applies mapping transformation above and stores it under the property with the same name
 - string: applies mapping transformation above and stores it under a property whose name is the specified string
 - function: Stores the returned fields under those names in the result
*/

/**
 * All the mapping functions to map properties to css spacings
 */
export const cssSpacingMappers = createMapper(mapSpacing, {
    margin: true,
    marginX: (spacing, theme) => ({
        marginLeft: mapSpacing(spacing, theme),
        marginRight: mapSpacing(spacing, theme),
    }),
    marginY: (spacing, theme) => ({
        marginTop: mapSpacing(spacing, theme),
        marginBottom: mapSpacing(spacing, theme),
    }),
    marginTop: true,
    marginRight: true,
    marginBottom: true,
    marginLeft: true,
    padding: true,
    paddingX: (spacing, theme) => ({
        paddingLeft: mapSpacing(spacing, theme),
        paddingRight: mapSpacing(spacing, theme),
    }),
    paddingY: (spacing, theme) => ({
        paddingTop: mapSpacing(spacing, theme),
        paddingBottom: mapSpacing(spacing, theme),
    }),
    paddingTop: true,
    paddingRight: true,
    paddingBottom: true,
    paddingLeft: true,
    top: true,
    right: true,
    bottom: true,
    left: true,
    columnWidth: true,
    lineHeight: true,
    outlineOffset: true,
});

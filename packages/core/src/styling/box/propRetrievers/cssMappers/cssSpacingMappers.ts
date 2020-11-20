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

/**
 * Retrieves a given spacing value from the the theme, or defaults to auto
 * @param spacing The spacing value to retrieve
 * @param theme The theme to retrieve the spacing from
 * @returns The spacing value
 */
export function mapSpacingWithAuto(
    spacing: IThemeSpacing | "auto",
    theme: ITheme
): number | string {
    return spacing == "auto" ? "auto" : theme.spacing[spacing];
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
    margin: mapSpacingWithAuto,
    marginX: (spacing: IThemeSpacing | "auto", theme) => ({
        marginLeft: mapSpacingWithAuto(spacing, theme),
        marginRight: mapSpacingWithAuto(spacing, theme),
    }),
    marginY: (spacing: IThemeSpacing | "auto", theme) => ({
        marginTop: mapSpacingWithAuto(spacing, theme),
        marginBottom: mapSpacingWithAuto(spacing, theme),
    }),
    marginTop: mapSpacingWithAuto,
    marginRight: mapSpacingWithAuto,
    marginBottom: mapSpacingWithAuto,
    marginLeft: mapSpacingWithAuto,
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

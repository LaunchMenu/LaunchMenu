import {
    IThemeElevation,
    IThemeFont,
    IThemeRadius,
    IThemeBorder,
} from "../../../theming/_types/IBaseTheme";
import {ITheme} from "../../../theming/_types/ITheme";
import {
    IBorder,
    IBorderBottom,
    IBorderTop,
    IBorderLeft,
    IBorderRight,
} from "../../../theming/_types/IBorder";

/**
 * Maps a border style to a given side
 * @param side The side to map to
 * @param border The border input name
 * @param theme The theme to extract the border from
 * @returns A border style
 */
function mapBorderSide(side: string, border: IThemeBorder, theme: ITheme): IBorder {
    const borderData = theme.border[border];
    if (!borderData) return border as any;
    const result = {} as {[key: string]: IBorder[keyof IBorder]};
    Object.keys(borderData).forEach((propName: keyof IBorder) => {
        result[propName.replace("border", `border${side}`)] = borderData[propName];
    });
    return result;
}

/**
 * All the mapping functions to map properties to css
 */
export const cssThemeMappers = {
    elevation: (elevation: IThemeElevation, theme: ITheme) => ({
        boxShadow: theme.elevation[elevation],
    }),
    font: (font: IThemeFont, theme: ITheme) => theme.font[font] ?? font,
    // Border styles
    border: (border: IThemeBorder, theme: ITheme) => theme.border[border] ?? border,
    borderTop: mapBorderSide.bind(null, "Top") as (
        border: IThemeBorder,
        theme: ITheme
    ) => IBorderTop,
    borderBottom: mapBorderSide.bind(null, "Bottom") as (
        border: IThemeBorder,
        theme: ITheme
    ) => IBorderBottom,
    borderLeft: mapBorderSide.bind(null, "Left") as (
        border: IThemeBorder,
        theme: ITheme
    ) => IBorderLeft,
    borderRight: mapBorderSide.bind(null, "Right") as (
        border: IThemeBorder,
        theme: ITheme
    ) => IBorderRight,
    // Border radii
    borderRadius: (radius: IThemeRadius, theme: ITheme) => ({
        borderRadius: theme.radius[radius],
    }),
    borderRadiusBottomLeft: (radius: IThemeRadius, theme: ITheme) => ({
        borderBottomLeftRadius: theme.radius[radius],
    }),
    borderRadiusBottomRight: (radius: IThemeRadius, theme: ITheme) => ({
        borderBottomRightRadius: theme.radius[radius],
    }),
    borderRadiusTopLeft: (radius: IThemeRadius, theme: ITheme) => ({
        borderTopLeftRadius: theme.radius[radius],
    }),
    borderRadiusTopRight: (radius: IThemeRadius, theme: ITheme) => ({
        borderTopRightRadius: theme.radius[radius],
    }),
};

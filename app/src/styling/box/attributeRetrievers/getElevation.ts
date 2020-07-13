import {IAnyProps} from "./_types/IAnyProps";
import {getAttributes} from "./getAttributes";
import {ITheme} from "../../theming/_types/ITheme";

/**
 * The elevation attribute,
 * mapped to either true if the css camelcase name is the same,
 * or a string if it's different
 */
export const elevationAttributes = {
    elevation: "boxShadow",
};

/**
 * The color attributes that can be assigned
 */
export type ElevationAttributes = {
    [P in keyof typeof elevationAttributes]?: keyof ITheme["elevations"];
};

/**
 * Retrieves the elevation attribute their css equivalent, with the value obtained from the theme
 * @param props The props to retrieve the elevation from
 * @param theme The theme to get the elevation from
 * @returns The css props
 */
export function getElevationAttribute(props: IAnyProps, theme: ITheme): IAnyProps {
    return getAttributes(
        props,
        elevationAttributes,
        (value: any) => theme.elevations[value] || value
    );
}

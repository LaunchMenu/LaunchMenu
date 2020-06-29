import {AnyProps} from "./_types/anyProps";
import {getAttributes} from "./getAttributes";
import {ITheme} from "../../theming/_types/ITheme";

/**
 * All the spacing attributes that accept any spacing,
 * mapped to either true if the css camelcase name is the same,
 * or a string or function if it's different
 */
export const spacingAttributesCustom = {
    marginCustom: "margin",
    marginTopCustom: "marginTop",
    marginRightCustom: "marginRight",
    marginBottomCustom: "marginBottom",
    marginLeftCustom: "marginLeft",
    marginXCustom: (props: AnyProps, value: any) => {
        props["marginLeft"] = value;
        props["marginRight"] = value;
    },
    marginYCustom: (props: AnyProps, value: any) => {
        props["marginTop"] = value;
        props["marginBottom"] = value;
    },
    paddingCustom: "padding",
    paddingTopCustom: "paddingTop",
    paddingRightCustom: "paddingRight",
    paddingBottomCustom: "paddingBottom",
    paddingLeftCustom: "paddingLeft",
    paddingXCustom: (props: AnyProps, value: any) => {
        props["paddingLeft"] = value;
        props["paddingRight"] = value;
    },
    paddingYCustom: (props: AnyProps, value: any) => {
        props["paddingTop"] = value;
        props["paddingBottom"] = value;
    },
    borderCustom: "borderWidth",
    borderTopCustom: "borderTopWidth",
    borderRightCustom: "borderRightWidth",
    borderBottomCustom: "borderBottomWidth",
    borderLeftCusom: "borderLeftWidth",
    borderXCustom: (props: AnyProps, value: any) => {
        props["borderLeftWidth"] = value;
        props["borderRightWidth"] = value;
    },
    borderYCustom: (props: AnyProps, value: any) => {
        props["borderTopWidth"] = value;
        props["borderRightWidth"] = value;
    },
    borderRadiusCustom: "borderRadius",
    outlineOffsetCustom: "outlineOffset",
    topCustom: "top",
    rightCustom: "right",
    bottomCustom: "bottom",
    leftCustom: "left",
    columnWidthCustom: "columnWidth",
    lineHeightCustom: "lineHeight",
};

/**
 * All the spacing attributes that accept only theme spacing,
 * mapped to either true if the css camelcase name is the same,
 * or a string or function if it's different
 */
export const spacingAttributesTheme = {
    margin: true,
    marginTop: true,
    marginRight: true,
    marginBottom: true,
    marginLeft: true,
    marginX: (props: AnyProps, value: any) => {
        props["marginLeft"] = value;
        props["marginRight"] = value;
    },
    marginY: (props: AnyProps, value: any) => {
        props["marginTop"] = value;
        props["marginBottom"] = value;
    },
    padding: true,
    paddingTop: true,
    paddingRight: true,
    paddingBottom: true,
    paddingLeft: true,
    paddingX: (props: AnyProps, value: any) => {
        props["paddingLeft"] = value;
        props["paddingRight"] = value;
    },
    paddingY: (props: AnyProps, value: any) => {
        props["paddingTop"] = value;
        props["paddingBottom"] = value;
    },
    border: "borderWidth",
    borderTop: "borderTopWidth",
    borderRight: "borderRightWidth",
    borderBottom: "borderBottomWidth",
    borderLeft: "borderLeftWidth",
    borderX: (props: AnyProps, value: any) => {
        props["borderLeftWidth"] = value;
        props["borderRightWidth"] = value;
    },
    borderY: (props: AnyProps, value: any) => {
        props["borderTopWidth"] = value;
        props["borderRightWidth"] = value;
    },
    borderRadius: true,
    outlineOffset: true,
    top: true,
    right: true,
    bottom: true,
    left: true,
    columnWidth: true,
    lineHeight: true,
};

/**
 * All the spacing attributes,
 * mapped to either true if the css camelcase name is the same,
 * or a string or function if it's different
 */
export const spacingAttributes = {
    ...spacingAttributesCustom,
    ...spacingAttributesTheme,
};

/**
 * The spacing attributes that can be assigned
 */
export type SpacingAttributes = {
    [P in keyof typeof spacingAttributesCustom]?: string | number;
} &
    {
        [P in keyof typeof spacingAttributesTheme]?: number;
    };

/**
 * Retrieves all spacing attributes their css equivalent, with the value obtained from the theme
 * @param props The props to retrieve the spacing from
 * @param theme The theme to get the spacing values from
 * @returns The css props
 */
export function getSpacingAttributes(props: AnyProps, theme: ITheme): AnyProps {
    return getAttributes(
        props,
        spacingAttributes,
        (value: any) => theme.spacing(value) || value
    );
}

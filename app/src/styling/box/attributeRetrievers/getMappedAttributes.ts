import {AnyProps} from "./_types/anyProps";
import {getAttributes} from "./getAttributes";
import {
    CssDisplay,
    CssPosition,
    CssFlexDirection,
    CssJustifyContent,
    CssAlignItems,
    CssAlignContent,
    CssAlignSelf,
    CssVerticalAlign,
    CssOverflow,
    CssBorderStyle,
} from "./_types/cssTypes";

/**
 * All the standard attributes, mapped to either true if the css camelcase name is the same,
 * or a string if it's different
 */
export const mappedAttributes = {
    width: true,
    height: true,
    minWidth: true,
    minHeight: true,
    maxWidth: true,
    maxHeight: true,
    display: true,
    position: true,
    overflow: true,
    overflowX: true,
    overflowY: true,
    borderStyle: true,
    borderTopStyle: true,
    borderRightStyle: true,
    borderBottomStyle: true,
    borderLeftStyle: true,
    verticalAlign: true,
    flexDirection: true,
    flexWrap: true,
    justifyContent: true,
    alignItems: true,
    alignContent: true,
    alignSelf: true,
    zIndex: true,
    order: true,
    flexGrow: true,
    flexShrink: true,
    flexBasis: true,
    flex: true,
    cursor: true,
};

/**
 * The attributes that can be assigned
 */
export type MappedAttributes = {
    display?: CssDisplay;
    position?: CssPosition;
    overflow?: CssOverflow;
    overflowX?: CssOverflow;
    overflowY?: CssOverflow;
    borderStyle?: CssBorderStyle;
    borderTopStyle?: CssBorderStyle;
    borderRightStyle?: CssBorderStyle;
    borderBottomStyle?: CssBorderStyle;
    borderLeftStyle?: CssBorderStyle;
    verticalAlign?: CssVerticalAlign;
    flexDirection?: CssFlexDirection;
    flexWrap?: CssFlexDirection;
    justifyContent?: CssJustifyContent;
    alignItems?: CssAlignItems;
    alignContent?: CssAlignContent;
    alignSelf?: CssAlignSelf;
    zIndex?: number;
    order?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: string;
    flex?: string;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;

    // TODO: add grid attributes
};

/**
 * Retrieves all attributes their css equivalent
 * @param props The props to retrieve the data from
 * @returns The css props
 */
export function getMappedAttributes(props: AnyProps): AnyProps {
    return getAttributes(props, mappedAttributes, (value: any) => value);
}

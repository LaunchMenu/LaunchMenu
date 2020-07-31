import {IAnyProps} from "./_types/IAnyProps";
import {getAttributes} from "./getAttributes";
import {
    ICssDisplay,
    ICssPosition,
    ICssFlexDirection,
    ICssJustifyContent,
    ICssAlignItems,
    ICssAlignContent,
    ICssAlignSelf,
    ICssVerticalAlign,
    ICssOverflow,
    ICssBorderStyle,
    ICssVisibility,
    ICssPointerEvents,
} from "./_types/ICssTypes";

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
    visibility: true,
    zIndex: true,
    order: true,
    flexGrow: true,
    flexShrink: true,
    flexBasis: true,
    flex: true,
    cursor: true,
    opacity: true,
    pointerEvents: true,
    noSelect: (out: IAnyProps, value: boolean) => {
        if (value) out.userSelect = "none";
    },
    shadowCut: (
        out: IAnyProps,
        value: Partial<("left" | "right" | "top" | "bottom")[]>
    ) => {
        let sides = {left: -100, right: -100, top: -100, bottom: -100};
        value.forEach(side => (sides[side as any] = 0));
        out.clipPath = `inset(${sides.top}px ${sides.right}px ${sides.bottom}px ${sides.left}px)`;
    },
};

/**
 * The attributes that can be assigned
 */
export type MappedAttributes = {
    display?: ICssDisplay;
    position?: ICssPosition;
    overflow?: ICssOverflow;
    overflowX?: ICssOverflow;
    overflowY?: ICssOverflow;
    borderStyle?: ICssBorderStyle;
    borderTopStyle?: ICssBorderStyle;
    borderRightStyle?: ICssBorderStyle;
    borderBottomStyle?: ICssBorderStyle;
    borderLeftStyle?: ICssBorderStyle;
    verticalAlign?: ICssVerticalAlign;
    flexDirection?: ICssFlexDirection;
    flexWrap?: ICssFlexDirection;
    justifyContent?: ICssJustifyContent;
    alignItems?: ICssAlignItems;
    alignContent?: ICssAlignContent;
    alignSelf?: ICssAlignSelf;
    visibility?: ICssVisibility;
    pointerEvents?: ICssPointerEvents;
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
    cursor?: string;
    opacity?: number;
    noSelect?: boolean;
    /** Specifies sides to remove the shadow from */
    shadowCut?: Partial<("left" | "right" | "top" | "bottom")[]>;

    // TODO: add grid attributes
};

/**
 * Retrieves all attributes their css equivalent
 * @param props The props to retrieve the data from
 * @returns The css props
 */
export function getMappedAttributes(props: IAnyProps): IAnyProps {
    return getAttributes(props, mappedAttributes, (value: any) => value);
}

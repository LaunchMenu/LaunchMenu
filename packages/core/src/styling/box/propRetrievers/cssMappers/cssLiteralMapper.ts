import {
    ICssDisplay,
    ICssPosition,
    ICssOverflow,
    ICssBorderStyle,
    ICssVerticalAlign,
    ICssFlexDirection,
    ICssJustifyContent,
    ICssAlignItems,
    ICssAlignContent,
    ICssAlignSelf,
    ICssVisibility,
    ICssPointerEvents,
    ICssWhiteSpace,
    ICssFloat,
    ICssCursor,
    ICssFlexWrap,
    ICssBoxSizing,
} from "../_types/ICssTypes";

/*
 - true: applies mapping transformation above and stores it under the property with the same name
 - string: applies mapping transformation above and stores it under a property whose name is the specified string
 - function: Stores the returned fields under those names in the result
*/

/**
 * All the mapping functions to map css properties
 */
export const cssLiteralMappers = {
    display: (p: ICssDisplay) => p,
    position: (p: ICssPosition) => p,
    overflow: (p: ICssOverflow) => p,
    overflowX: (p: ICssOverflow) => p,
    overflowY: (p: ICssOverflow) => p,
    borderStyle: (p: ICssBorderStyle) => p,
    borderTopStyle: (p: ICssBorderStyle) => p,
    borderBottomStyle: (p: ICssBorderStyle) => p,
    borderLeftStyle: (p: ICssBorderStyle) => p,
    borderRightStyle: (p: ICssBorderStyle) => p,
    verticalAlign: (p: ICssVerticalAlign) => p,
    flexDirection: (p: ICssFlexDirection) => p,
    flexWrap: (p: ICssFlexWrap) => p,
    justifyContent: (p: ICssJustifyContent) => p,
    alignItems: (p: ICssAlignItems) => p,
    alignContent: (p: ICssAlignContent) => p,
    alignSelf: (p: ICssAlignSelf) => p,
    visibility: (p: ICssVisibility) => p,
    pointerEvents: (p: ICssPointerEvents) => p,
    whiteSpace: (p: ICssWhiteSpace) => p,
    float: (p: ICssFloat) => p,
    cursor: (p: ICssCursor) => p,
    boxSizing: (p: ICssBoxSizing) => p,
    zIndex: (p: number) => p,
    order: (p: number) => p,
    flexGrow: (p: number) => p,
    flexShrink: (p: number) => p,
    flexBasis: (p: string) => p,
    flex: (p: string) => p,
    width: (p: string | number) => p,
    height: (p: string | number) => p,
    minWidth: (p: string | number) => p,
    minHeight: (p: string | number) => p,
    maxWidth: (p: string | number) => p,
    maxHeight: (p: string | number) => p,
    opacity: (p: number) => p,
    transition: (p: string) => p,
    noSelect: (value: boolean) => (value ? {userSelect: "none"} : {}),
    shadowCut: (value: Partial<("left" | "right" | "top" | "bottom")[]>) => {
        const sides = {left: -100, right: -100, top: -100, bottom: -100};
        value.forEach(side => (sides[side as keyof typeof sides] = 0));
        return {
            clipPath: `inset(${sides.top}px ${sides.right}px ${sides.bottom}px ${sides.left}px)`,
        };
    },
};

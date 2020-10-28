export type ICssDisplay =
    | "inline"
    | "block"
    | "contents"
    | "flex"
    | "grid"
    | "inline-block"
    | "inline-flex"
    | "inline-grid"
    | "inline-table"
    | "list-item"
    | "run-in"
    | "table"
    | "table-caption"
    | "table-column-group"
    | "table-header-group"
    | "table-footer-group"
    | "table-row-group"
    | "table-cell-group"
    | "table-column"
    | "table-row"
    | "none"
    | "initial"
    | "inherit";

export type ICssPosition =
    | "static"
    | "absolute"
    | "fixed"
    | "relative"
    | "sticky"
    | "initial"
    | "inherit";
export type ICssVerticalAlign =
    | "baseline"
    | "bottom"
    | "inherit"
    | "initial"
    | "middle"
    | "sub"
    | "super"
    | "text-bottom"
    | "text-top"
    | "top"
    | "unset";

export type ICssOverflow =
    | "visible"
    | "hidden"
    | "scroll"
    | "auto"
    | "initial"
    | "inherit";

export type ICssBorderStyle =
    | "none"
    | "hidden"
    | "dotted"
    | "dashed"
    | "solid"
    | "double"
    | "groove"
    | "ridge"
    | "inset"
    | "outset"
    | "initial"
    | "inherit";

export type ICssFlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type ICssFlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export type ICssJustifyContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
export type ICssAlignItems =
    | "stretch"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline";
export type ICssAlignContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
export type ICssAlignSelf =
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";

export type ICssVisibility = "visible" | "hidden" | "collapse" | "initial" | "inherit";

export type ICssPointerEvents = "auto" | "none" | "inherit" | "initial" | "unset";

export type ICssWhiteSpace =
    | "break-spaces"
    | "normal"
    | "nowrap"
    | "pre"
    | "pre-line"
    | "pre-wrap"
    | "inherit"
    | "initial"
    | "unset";

export type ICssFloat = "left" | "right" | "none" | "inherit";

export type ICssCursor =
    | "auto"
    | "default"
    | "none"
    | "context-menu"
    | "help"
    | "pointer"
    | "progress"
    | "wait"
    | "cell"
    | "crosshair"
    | "text"
    | "vertical-text"
    | "alias"
    | "copy"
    | "move"
    | "no-drop"
    | "not-allowed"
    | "grab"
    | "grabbing"
    | "all-scroll"
    | "col-resize"
    | "row-resize"
    | "n-resize"
    | "e-resize"
    | "s-resize"
    | "w-resize"
    | "ne-resize"
    | "nw-resize"
    | "se-resize"
    | "sw-resize"
    | "ew-resize"
    | "ns-resize"
    | "nesw-resize"
    | "nwse-resize"
    | "zoom-in"
    | "zoom-out";

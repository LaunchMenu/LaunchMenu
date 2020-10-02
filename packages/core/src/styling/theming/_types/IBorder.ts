export type IBorderType =
    | "none"
    | "hidden"
    | "dotted"
    | "dashed"
    | "solid"
    | "double"
    | "groove"
    | "ridge"
    | "inset"
    | "outset";

export type IBorder = {
    borderWidth?: number | string;
    borderStyle?: IBorderType;
    borderColor?: string;
};

export type IBorderLeft = {
    borderLeftWidth?: number | string;
    borderLeftStyle?: IBorderType;
    borderLeftColor?: string;
};
export type IBorderRight = {
    borderRightWidth?: number | string;
    borderRightStyle?: IBorderType;
    borderRightColor?: string;
};
export type IBorderTop = {
    borderTopWidth?: number | string;
    borderTopStyle?: IBorderType;
    borderTopColor?: string;
};
export type IBorderBottom = {
    borderBottomWidth?: number | string;
    borderBottomStyle?: IBorderType;
    borderBottomColor?: string;
};

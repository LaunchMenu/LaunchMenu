import {IHighlightStyle} from "./IHighlightStyle";
import {ObjectInterpolation} from "@emotion/core";

/**
 * A syntax styling theme
 */
export type IHighlightTheme = {
    selection: ObjectInterpolation<undefined>;
    cursor: ObjectInterpolation<undefined>;
    syntax: IHighlightStyle[];
};

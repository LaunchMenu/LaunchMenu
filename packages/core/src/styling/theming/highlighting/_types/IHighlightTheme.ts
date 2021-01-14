import {IHighlightStyle} from "./IHighlightStyle";
import {CSSObject} from "@emotion/serialize";

/**
 * A syntax styling theme
 */
export type IHighlightTheme = {
    selection: CSSObject;
    cursor: CSSObject;
    syntax: IHighlightStyle[];
};

import {IHighlightStyle} from "./IHighlightStyle";
import {IBaseTheme} from "../../_types/IBaseTheme";
import {CSSObject} from "@emotion/serialize";

type IHighlightThemeInputObject = {
    selection?: CSSObject;
    cursor?: CSSObject;
    syntax: IHighlightStyle[];
};

/**
 * An input for a syntax styling theme
 */
export type IHighlightThemeInput =
    | ((theme: IBaseTheme) => IHighlightThemeInputObject)
    | IHighlightThemeInputObject;

import {IHighlightStyle} from "./IHighlightStyle";
import {IBaseTheme} from "../../_types/IBaseTheme";
import {ObjectInterpolation} from "@emotion/core";

type IHighlightThemeInputObject = {
    selection?: ObjectInterpolation<undefined>;
    cursor?: ObjectInterpolation<undefined>;
    syntax: IHighlightStyle[];
};

/**
 * An input for a syntax styling theme
 */
export type IHighlightThemeInput =
    | ((theme: IBaseTheme) => IHighlightThemeInputObject)
    | IHighlightThemeInputObject;

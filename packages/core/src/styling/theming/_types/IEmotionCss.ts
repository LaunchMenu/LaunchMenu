import {ObjectInterpolation} from "@emotion/core";
import {ITheme} from "./ITheme";

/**
 * The standard css emotion accepts
 */
export type IEmotionCss =
    | ObjectInterpolation<undefined>
    | ((theme: ITheme) => ObjectInterpolation<undefined>);

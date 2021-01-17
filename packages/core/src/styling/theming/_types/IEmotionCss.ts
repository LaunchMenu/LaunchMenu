import {CSSObject} from "@emotion/serialize";
import {ITheme} from "./ITheme";

/**
 * The standard css emotion accepts
 */
export type IEmotionCss = CSSObject | ((theme: ITheme) => CSSObject);

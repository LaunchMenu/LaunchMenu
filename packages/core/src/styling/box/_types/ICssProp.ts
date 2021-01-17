import {CSSObject} from "@emotion/serialize";
import {ITheme} from "../../theming/_types/ITheme";

export type ICssProp = CSSObject | ((theme: ITheme) => CSSObject);

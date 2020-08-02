import {ObjectInterpolation} from "@emotion/core";
import {ITheme} from "../../theming/_types/ITheme";

export type ICssProp =
    | ObjectInterpolation<undefined>
    | ((theme: ITheme) => ObjectInterpolation<undefined>);

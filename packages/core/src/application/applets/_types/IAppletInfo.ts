import {ReactElement} from "react";
import {IThemeIcon} from "../../../styling/theming/_types/IBaseTheme";

/**
 * Information to use for listing applets
 */
export type IAppletInfo = {
    name: string;
    description: string;
    version: string;
    icon: IThemeIcon | ReactElement;
    tags?: string[];
};

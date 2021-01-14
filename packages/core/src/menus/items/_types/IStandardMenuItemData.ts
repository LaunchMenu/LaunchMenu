import {IDataHook} from "model-react";
import {ReactElement} from "react";
import {IThemeIcon} from "../../../styling/theming/_types/IBaseTheme";
import {IStandardActionBindingData} from "./IStandardActionBindingData";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = IStandardActionBindingData & {
    /** The icon of the menu item */
    icon?:
        | IThemeIcon
        | ReactElement
        | ((h?: IDataHook) => IThemeIcon | ReactElement | undefined);
};

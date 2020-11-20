import {IDataHook} from "model-react";
import {ReactNode} from "react";
import {IStandardActionBindingData} from "./IStandardActionBindingData";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = IStandardActionBindingData & {
    /** The icon of the menu item */
    icon?: string | ReactNode | ((h?: IDataHook) => string | ReactNode | undefined);
};

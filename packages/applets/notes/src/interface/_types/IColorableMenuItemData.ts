import {IStandardMenuItemData, ISubscribable} from "@launchmenu/core";

/** The data that a colorable menu item accepts */
export type IColorableMenuItemData = {
    /** The color of the menu item */
    color?: ISubscribable<string | undefined>;
} & IStandardMenuItemData;

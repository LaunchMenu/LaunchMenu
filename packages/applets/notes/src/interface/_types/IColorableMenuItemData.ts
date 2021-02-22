import {ICategory, IStandardMenuItemData, ISubscribable} from "@launchmenu/core";

/** The data that a colorable menu item accepts */
export type IColorableMenuItemData = {
    /** The color of the menu item */
    color?: ISubscribable<string | undefined>;
    /** Whether to align the description content to the right */
    rightAlignDescription?: boolean;
    /** If this menu item should be one to represent a category, this function should return that category*/
    asCategory?: () => ICategory;
} & IStandardMenuItemData;

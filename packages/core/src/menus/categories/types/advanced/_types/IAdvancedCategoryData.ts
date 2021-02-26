import {ISubscribable} from "../../../../../utils/subscribables/_types/ISubscribable";
import {IStandardMenuItemData} from "../../../../items/_types/IStandardMenuItemData";

export type IAdvancedCategoryData = Omit<IStandardMenuItemData, "name"> & {
    /** The category's name/ID */
    name: string;
    /** The display name of the menu item, defaults to the category name */
    displayName?: ISubscribable<string>;
};

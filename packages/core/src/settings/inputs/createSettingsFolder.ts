import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IFolderMenuItemData} from "../../menus/items/_types/IFolderMenuItemData";
import {createFolderMenuItem} from "../../menus/items/types/createFolderMenuItem";
import {ISettingsFolderMenuItem} from "../_types/ISettingsFolderMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new settings category to organize the settings
 * @param data The data to create the category with
 * @returns The menu item that can be displayed, as well as the children settings
 */
export function createSettingsFolder<
    T extends {
        [key: string]: IFieldMenuItem<any> | ISettingsFolderMenuItem;
    }
>(data: IFolderMenuItemData<T>): ISettingsFolderMenuItem<T> {
    return createFolderMenuItem({
        icon: "settings",
        searchPattern: settingPatternMatcher,
        searchIcon: "settings",
        ...data,
    });
}

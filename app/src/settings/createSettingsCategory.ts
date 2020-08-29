import {IFieldMenuItem} from "../menus/items/inputs/_types/IFieldMenuItem";
import {IFolderMenuItemData} from "../menus/items/_types/IFolderMenuItemData";
import {createFolderMenuItem} from "../menus/items/createFolderMenuItem";
import {ISettingsCategoryMenuItem} from "./_types/ISettingsCategoryMenuItem";

/**
 * Creates a new settings category to organize the settings
 * @param data The data to create the category with
 * @returns The menu item that can be displayed, as well as the children settings
 */
export function createSettingsCategory<
    T extends {[key: string]: IFieldMenuItem<any> | ISettingsCategoryMenuItem}
>(data: IFolderMenuItemData<T>): ISettingsCategoryMenuItem<T> {
    return createFolderMenuItem(data);
}

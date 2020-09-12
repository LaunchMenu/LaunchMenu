import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IFolderMenuItemData} from "../../menus/items/_types/IFolderMenuItemData";
import {createFolderMenuItem} from "../../menus/items/createFolderMenuItem";
import {ISettingsCategoryMenuItem} from "../_types/ISettingsCategoryMenuItem";
import {ISerializable} from "../_types/serialization/ISerializable";
import {IJSONDeserializer} from "../_types/serialization/IJSONDeserializer";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new settings category to organize the settings
 * @param data The data to create the category with
 * @returns The menu item that can be displayed, as well as the children settings
 */
export function createSettingsCategory<
    T extends {
        [key: string]: IFieldMenuItem<ISerializable<S>> | ISettingsCategoryMenuItem<S>;
    },
    S extends IJSONDeserializer
>(data: IFolderMenuItemData<T>): ISettingsCategoryMenuItem<S, T> {
    return createFolderMenuItem({
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

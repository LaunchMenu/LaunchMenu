import {createBooleanMenuItem} from "../../menus/items/inputs/types/createBooleanMenuItem";
import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IBooleanMenuItemData} from "../../menus/items/inputs/types/_types/IBooleanMenuItemData";
import {settingPatternMatcher} from "./settingPatternMatcher";
import {ISettingConfigurer} from "../_types/ISettingConfigurer";
import {createFileMenuItem} from "../../menus/items/inputs/types/createFileMenuItem";
import {IFileMenuItemData} from "../../menus/items/inputs/types/_types/IFileMenuItemData";

/**
 * Creates a new file setting
 * @param data The file data
 * @returns The menu item/field
 */
export function createFileSetting(
    data: IFileMenuItemData
): IFieldMenuItem<string> & ISettingConfigurer {
    return createFileMenuItem({
        icon: "settings",
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

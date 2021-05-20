import {createBooleanMenuItem} from "../../menus/items/inputs/types/createBooleanMenuItem";
import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IBooleanMenuItemData} from "../../menus/items/inputs/types/_types/IBooleanMenuItemData";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new boolean setting
 * @param data The boolean data
 * @returns The menu item/field
 */
export function createBooleanSetting(
    data: IBooleanMenuItemData
): IFieldMenuItem<boolean> {
    return createBooleanMenuItem({
        icon: "settings",
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

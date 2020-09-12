import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {INumberMenuItemData} from "../../menus/items/inputs/types/_types/INumberMenuItemData";
import {createNumberMenuItem} from "../../menus/items/inputs/types/createNumberMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new number setting
 * @param data The number data
 * @returns The menu item/field
 */
export function createNumberSetting(data: INumberMenuItemData): IFieldMenuItem<number> {
    return createNumberMenuItem({
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

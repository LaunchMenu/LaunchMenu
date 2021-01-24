import {IOptionMenuItemData} from "../../menus/items/inputs/types/_types/IOptionMenuItemData";
import {createOptionMenuItem} from "../../menus/items/inputs/types/createOptionMenuItem";
import {IJSON} from "../../_types/IJSON";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new option setting
 * @param data The option data
 * @returns The menu item/field
 */
export function createOptionSetting<T extends IJSON>(data: IOptionMenuItemData<T>) {
    return createOptionMenuItem({
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

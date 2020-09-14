import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IColorMenuItemData} from "../../menus/items/inputs/types/_types/IColorMenuItemData";
import {createColorMenuItem} from "../../menus/items/inputs/types/createColorMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new color setting
 * @param data The color data
 * @returns The menu item/field
 */
export function createColorSetting(data: IColorMenuItemData): IFieldMenuItem<string> {
    return createColorMenuItem({
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

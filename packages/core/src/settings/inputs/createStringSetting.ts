import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IStringMenuItemData} from "../../menus/items/inputs/types/_types/IStringMenuItemData";
import {createStringMenuItem} from "../../menus/items/inputs/types/createStringMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new string setting
 * @param data The string data
 * @returns The menu item/field
 */
export function createStringSetting(data: IStringMenuItemData): IFieldMenuItem<string> {
    return createStringMenuItem({
        icon: "settings",
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

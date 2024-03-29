import {IFieldMenuItem} from "../../menus/items/inputs/_types/IFieldMenuItem";
import {IKeyPatternMenuItemData} from "../../menus/items/inputs/types/_types/IKeyPatternMenuItemData";
import {KeyPattern} from "../../keyHandler/KeyPattern";
import {createKeyPatternMenuItem} from "../../menus/items/inputs/types/createKeyPatternMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";

/**
 * Creates a new key pattern setting
 * @param data The key pattern data
 * @returns The menu item/field
 */
export function createKeyPatternSetting(
    data: IKeyPatternMenuItemData
): IFieldMenuItem<KeyPattern> {
    return createKeyPatternMenuItem({
        icon: "settings",
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

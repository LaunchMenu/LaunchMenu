import {IKeyPatternMenuItemData} from "../../menus/items/inputs/types/_types/IKeyPatternMenuItemData";
import {createGlobalKeyPatternMenuItem} from "../../menus/items/inputs/types/createGlobalKeyPatternMenuItem";
import {settingPatternMatcher} from "./settingPatternMatcher";
import {ITriggerablePatternMenuItem} from "../../menus/items/inputs/types/_types/ITriggerableKeyPatternMenuItem";

/**
 * Creates a new global key pattern setting, which can listens to key events even when LM isn't focused
 * @param data The key pattern data
 * @returns The menu item/field
 */
export function createGlobalKeyPatternSetting(
    data: IKeyPatternMenuItemData
): ITriggerablePatternMenuItem {
    return createGlobalKeyPatternMenuItem({
        icon: "settings",
        resetable: true,
        searchPattern: settingPatternMatcher,
        ...data,
    });
}

import {
    adjustSubscribable,
    createStandardMenuItem,
    IMenuItem,
    IStandardMenuItemData,
} from "@launchmenu/core";
import {helpPatternMatcher} from "./helpPatternMatcher";

/**
 * Creates a new help menu item
 * @param data The configuration of the item
 * @returns The created item
 */
export function createHelpItem(data: IStandardMenuItemData): IMenuItem {
    return createStandardMenuItem({
        searchPattern: helpPatternMatcher,
        // Fake execute to make the item selectable
        onExecute: () => {},
        ...data,
        tags: adjustSubscribable(data.tags ?? [], tags => [...tags, ""]),
    });
}

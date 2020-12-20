import {IStandardMenuItemData} from "../../../menus/items/_types/IStandardMenuItemData";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {IDataHook} from "model-react";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";

// TODO: add nice styling
/**
 * Creates a standard multi select menu item
 * @param isSelected The hook to check if the item is selected
 * @param config The data for the standard menu item
 * @returns The menu item
 */
export function createMultiSelectOptionMenuItem(
    isSelected: (hook?: IDataHook) => boolean,
    {name, ...rest}: IStandardMenuItemData
): IMenuItem {
    return createStandardMenuItem({
        name: h =>
            (isSelected(h) ? "✓ " : "") + (name instanceof Function ? name(h) : name),
        ...rest,
    });
}

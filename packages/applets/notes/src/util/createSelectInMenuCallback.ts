import {IMenu, IMenuItem} from "@launchmenu/core";
import {IDataHook, waitFor} from "model-react";

/**
 * Creates a function that can be used to select a given item in the specified menu upon creation
 * @param getMenu The menu to select the item in
 * @param getMenuItem The callback to retrieve the menu item given the item
 * @returns The callback function that can be used for menu item selection
 */
export function createSelectInMenuCallback<T>(
    getMenu: () => IMenu,
    getMenuItem: (item: T, hook?: IDataHook) => IMenuItem | undefined
): (item: T, initial: boolean) => Promise<void> {
    return async (item: T, initial: boolean) => {
        if (!initial) return;

        // Wait for a note item to exist
        await waitFor(h => !!getMenuItem(item, h));
        const menuItem = getMenuItem(item) as IMenuItem;

        // Wait for the menu to contain the item
        const menu = getMenu();
        await waitFor(h => menu.getItems(h).includes(menuItem));
        menu.setCursor(menuItem);
    };
}

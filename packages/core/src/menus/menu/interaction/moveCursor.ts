import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {isItemSelectable} from "../../items/isItemSelectable";

/**
 * Moves the cursor in the menu up or down
 * @param menu The menu to move the cursor in
 * @param up Whether to move up or down
 * @returns The new cursor of the menu
 */
export function moveCursor(menu: IMenu, up: boolean): IMenuItem | undefined {
    const items = menu.getItems();
    if (items.length == 0) return;
    const cursor = menu.getCursor();
    let index = cursor ? items.indexOf(cursor) : -1;

    // Find the new item index
    let newCursor: IMenuItem | undefined;
    for (let i = 0; i < items.length; i++) {
        // Move the index
        if (up) index--;
        else index++;

        // Wrap the items
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;

        // Make sure this is a valid cursor
        newCursor = items[index];
        if (isItemSelectable(newCursor)) break;
    }

    // Set the cursor
    if (!newCursor) return;
    menu.setCursor(newCursor);
    return newCursor;
}

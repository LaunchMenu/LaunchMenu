import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * Toggles the whether the given item is selected in the menu
 * @param menu The menu to toggle the selection in
 * @param item The item to toggle
 */
export function toggleItemSelection(menu: IMenu, item: IMenuItem): void {
    const selected = menu.getSelected();
    const isSelected = selected.includes(item);
    menu.setSelected(item, !isSelected);
}

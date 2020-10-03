import {IMenu} from "../menu/_types/IMenu";
import {getContextMenuItems} from "./getContextMenuItems";
import {openUI} from "../../context/openUI/openUI";
import {IIOContext} from "../../context/_types/IIOContext";
import {PrioritizedMenu} from "../menu/PrioritizedMenu";
import {sortContextCategories} from "./sortContextCategories";

/**
 * Opens a context menu for the selection of the given menu
 * @param menu The menu to perform the event for
 * @param ioContext The IO context to use to open the context menu
 * @param onClose The callback to call when the menu is closed
 * @returns A function that can be used to close the menu
 */
export function openContextMenu(
    menu: IMenu,
    ioContext: IIOContext = menu.getContext(),
    onClose?: () => void
): () => void {
    let close = () => {}; // placeholder
    const contextMenuItems = getContextMenuItems(menu.getAllSelected(), ioContext, () => {
        close();
    });
    if (contextMenuItems.length > 0)
        close = openUI(
            ioContext,
            {
                menu: new PrioritizedMenu(ioContext, contextMenuItems, {
                    sortCategories: sortContextCategories,
                }),
            },
            onClose
        );
    return close;
}

import {IMenu} from "../menu/_types/IMenu";
import {getContextMenuItems} from "./getContextMenuItems";
import {IIOContext} from "../../context/_types/IIOContext";
import {PrioritizedMenu} from "../menu/PrioritizedMenu";
import {sortContextCategories} from "./sortContextCategories";
import {UILayer} from "../../uiLayers/standardUILayer/UILayer";

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
    const contextMenuItems = getContextMenuItems(menu.getAllSelected(), ioContext);
    if (contextMenuItems.length > 0) {
        ioContext.open(
            new UILayer(
                {
                    menu: new PrioritizedMenu(ioContext, contextMenuItems, {
                        sortCategories: sortContextCategories,
                    }),
                    onExecute: close,
                },
                "context"
            ),
            onClose
        );
    }
    return close;
}

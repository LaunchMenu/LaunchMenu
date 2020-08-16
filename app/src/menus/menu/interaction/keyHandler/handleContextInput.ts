import {IMenu} from "../../_types/IMenu";
import {openContextMenu} from "../openContextMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * Handles context menu opening input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param ioContext The IO context to use to open the context menu
 * @returns Whether the event was caught
 */
export function handleContextInput(
    event: KeyEvent,
    menu: IMenu,
    ioContext: IIOContext
): void | boolean {
    if (event.is("tab")) {
        openContextMenu(menu, ioContext);
        return true;
    }
}

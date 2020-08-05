import {IMenu} from "../../_types/IMenu";
import {openContextMenu} from "../openContextMenu";
import {IKeyHandlerStack} from "../../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IViewStack} from "../../../../stacks/_types/IViewStack";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

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
    ioContext: {panes: {menu: IViewStack}; keyHandler: IKeyHandlerStack}
): void | boolean {
    if (event.is("tab")) {
        openContextMenu(menu, ioContext);
        return true;
    }
}

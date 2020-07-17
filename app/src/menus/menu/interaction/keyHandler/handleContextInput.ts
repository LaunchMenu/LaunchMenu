import {IKeyEvent} from "../../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {IMenu} from "../../_types/IMenu";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";
import {openContextMenu} from "../openContextMenu";
import {IKeyHandlerStack} from "../../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IViewStack} from "../../../../stacks/_types/IViewStack";

/**
 * Handles context menu opening input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param ioContext The IO context to use to open the context menu
 * @returns Whether the event was caught
 */
export function handleContextInput(
    event: IKeyEvent,
    menu: IMenu,
    ioContext: {panes: {menu: IViewStack}; keyHandler: IKeyHandlerStack}
): void | boolean {
    if (isDownEvent(event, "tab")) {
        openContextMenu(menu, ioContext);
        return true;
    }
}

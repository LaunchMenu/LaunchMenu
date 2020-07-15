import {IKeyEvent} from "../../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {IMenu} from "../../_types/IMenu";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";
import {ViewStack} from "../../../../stacks/ViewStack";
import {KeyHandlerStack} from "../../../../stacks/keyHandlerStack/KeyHandlerStack";
import {openContextMenu} from "../openContextMenu";

/**
 * Handles context menu opening input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param viewStack The view stack to add the context menu to
 * @param inputStack The key input handler stack
 * @returns Whether the event was caught
 */
export function handleContextInput(
    event: IKeyEvent,
    menu: IMenu,
    viewStack: ViewStack,
    inputStack: KeyHandlerStack
): void | boolean {
    if (isDownEvent(event, "tab")) {
        openContextMenu(menu, viewStack, inputStack);
        return true;
    }
}

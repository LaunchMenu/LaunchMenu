import {IKeyEvent} from "../../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {IMenu} from "../../_types/IMenu";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";
import {isKeyDown} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isKeyDown";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {moveCursor} from "../moveCursor";
import {toggleItemSelection} from "../toggleItemSelection";

/**
 * Handles selection movement input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleMoveInput(event: IKeyEvent, menu: IMenu): void | boolean {
    const down = isDownEvent(event, "downarrow");
    const up = isDownEvent(event, "uparrow");
    if (down || up) {
        const toggleSelection = event.shift;
        const newCursor = moveCursor(menu, up);

        // If shift was pressed, toggle selection
        if (newCursor && toggleSelection) toggleItemSelection(menu, newCursor);
        return true;
    }
    if (isDownEvent(event, "shift")) {
        const cursor = menu.getCursor();
        if (cursor) {
            toggleItemSelection(menu, cursor);
            return true;
        }
    }
}

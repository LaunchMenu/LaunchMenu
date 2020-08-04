import {IMenu} from "../../_types/IMenu";
import {moveCursor} from "../moveCursor";
import {toggleItemSelection} from "../toggleItemSelection";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles selection movement input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleMoveInput(event: KeyEvent, menu: IMenu): void | boolean {
    const down = event.is("down"); // TODO: create system for custom rate repeat
    const up = event.is("up");
    if (down || up) {
        const toggleSelection = event.shift;
        const newCursor = moveCursor(menu, up);

        // If shift was pressed, toggle selection
        if (newCursor && toggleSelection) toggleItemSelection(menu, newCursor);
        return true;
    }
    if (event.is("shift")) {
        const cursor = menu.getCursor();
        if (cursor) {
            toggleItemSelection(menu, cursor);
            return true;
        }
    }
}

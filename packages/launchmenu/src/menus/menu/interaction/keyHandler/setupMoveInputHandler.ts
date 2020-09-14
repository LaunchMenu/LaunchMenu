import {IMenu} from "../../_types/IMenu";
import {moveCursor} from "../moveCursor";
import {toggleItemSelection} from "../toggleItemSelection";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IKeyEventListenerObject} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Sets up a key event handler that listens for cursor movement and selection change events
 * @param menu The menu for which to add cursor controls
 * @returns An object with an event emit function and a destroy function
 */
export function setupMoveInputHandler(menu: IMenu): IKeyEventListenerObject {
    // // Whether we should toggle the cursor selection when letting go of shift
    let toggleCursorSelection = false;
    let newStateSelected = undefined as undefined | boolean;

    return {
        /**
         * Listens for cursor movement events
         * @param event The event that was emitted
         * @returns Whether the event was caught
         */
        emit(event: KeyEvent): boolean | undefined {
            const down = event.matches("down"); // TODO: create system for custom rate repeat
            const up = event.matches("up");
            if (down || up) {
                const oldCursor = menu.getCursor();
                const toggleSelection = event.shift;
                if (oldCursor && toggleSelection) {
                    if (newStateSelected === undefined)
                        newStateSelected = !menu.getSelected().includes(oldCursor);
                    menu.setSelected(oldCursor, newStateSelected);
                }

                // Move the cursor
                const newCursor = moveCursor(menu, up);

                // If shift was pressed, change selection
                if (newCursor && toggleSelection)
                    menu.setSelected(newCursor, newStateSelected);
                return true;
            }
            // Handle cursor selection toggling
            else if (event.is("shift", ["up", "down"])) {
                if (event.type == "down") toggleCursorSelection = true;
                if (event.type == "up") {
                    if (newStateSelected === undefined && toggleCursorSelection) {
                        const cursor = menu.getCursor();
                        if (cursor) toggleItemSelection(menu, cursor);
                    }
                    newStateSelected = undefined;
                    return true;
                }
            }
            // If any key other than shift or up or down is pressed, disable toggle
            else if (event.type == "down") toggleCursorSelection = false;
        },
    };
}

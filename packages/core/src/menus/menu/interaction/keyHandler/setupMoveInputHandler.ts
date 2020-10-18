import {IMenu} from "../../_types/IMenu";
import {moveCursor} from "../moveCursor";
import {toggleItemSelection} from "../toggleItemSelection";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {IKeyEventListenerObject} from "../../../../keyHandler/_types/IKeyEventListener";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {createMenuControlsSettingsFolder} from "../../../../application/settings/baseSettings/controls/createMenuControlsSettingsFolder";
import {TSettingsFromFactory} from "../../../../settings/_types/TSettingsFromFactory";
import {isMenuControlsSettingsFolder} from "./isMenuControlsSettingsFolder";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";

/**
 * Sets up a key event handler that listens for cursor movement and selection change events
 * @param menu The menu for which to add cursor controls
 * @returns An object with an event emit function and a destroy function
 */
export function setupMoveInputHandler(
    menu: IMenu,
    patterns:
        | {
              up: KeyPattern;
              down: KeyPattern;
              selectItem: KeyPattern;
          }
        | TSettingsFromFactory<
              typeof createMenuControlsSettingsFolder
          > = menu.getContext().settings.get(baseSettings).controls.menu
): IKeyEventListenerObject {
    const pPatterns = isMenuControlsSettingsFolder(patterns)
        ? (patterns = {
              up: patterns.up.get(),
              down: patterns.down.get(),
              selectItem: patterns.selectItem.get(),
          })
        : patterns;

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
            // TODO: create system for custom rate repeat
            const isUpKey = pPatterns.up.matches(event);
            const isDownKey = pPatterns.down.matches(event);
            if (isDownKey || isUpKey) {
                const oldCursor = menu.getCursor();
                const toggleSelection = event.shift;
                if (oldCursor && toggleSelection) {
                    if (newStateSelected === undefined)
                        newStateSelected = !menu.getSelected().includes(oldCursor);
                    menu.setSelected(oldCursor, newStateSelected);
                }

                // Move the cursor
                const newCursor = moveCursor(menu, isUpKey);

                // If shift was pressed, change selection
                if (newCursor && toggleSelection)
                    menu.setSelected(newCursor, newStateSelected);
                return true;
            }
            // Handle cursor selection toggling
            else if (pPatterns.selectItem.matches(event, true)) {
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

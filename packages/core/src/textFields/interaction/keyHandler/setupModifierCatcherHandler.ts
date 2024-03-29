import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";

/**
 * A handler that catches keyboard up event for modifiers if any other key was pressed since the modifier was activated.
 * Used for making 'shift' toggle selection in menu only if it wasn't used to update the text selection
 * @param modifiers The getter for the modifiers to catch
 * @param listener The listener object to wrap in order to detect whether the modifier was used
 * @returns A new key handler
 */
export function setupModifierCatcherHandler(
    modifiers: () => KeyPattern[],
    listener: IKeyEventListener
): IKeyEventListener {
    /** Stores whether any keys were caught since reset */
    let caughtKey = false;

    return async e => {
        // Handle modifier key catching
        const isModifier = modifiers().find(p => p.matches(e, true));
        if (isModifier) {
            if (e.type == "down") caughtKey = false;
            // If we release the selection key, and we actually used as a modifier for something, prevent the event sinking down
            if (e.type == "up" && caughtKey) return true;
        }

        if (await listener(e)) {
            caughtKey = true;
            return true;
        }
    };
}

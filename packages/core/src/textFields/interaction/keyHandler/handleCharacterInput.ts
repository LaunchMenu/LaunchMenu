import {insertText} from "../insertText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {isPlatform} from "../../../utils/ isPlatform";

/**
 * Handles typing of characters
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCharacterInput(
    event: KeyEvent,
    targetField: ITextEditTarget
): void | boolean {
    // On Mac all alt+keycodes produce symbols e.g.
    const isNormalKeyPress =
        !event.ctrl && !event.meta && (!event.alt || isPlatform("mac"));

    if (isNormalKeyPress && (event.type == "down" || event.type == "repeat")) {
        if (event.key.char) {
            insertText(targetField, event.key.char);
            return true;
        }
    }
}

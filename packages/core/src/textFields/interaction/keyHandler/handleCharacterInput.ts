import {ITextField} from "../../_types/ITextField";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";

/**
 * Handles typing of characters
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCharacterInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (!event.ctrl && !event.alt && (event.type == "down" || event.type == "repeat")) {
        if (event.key.char) {
            insertText(textField, event.key.char);
            return true;
        }
    }
}

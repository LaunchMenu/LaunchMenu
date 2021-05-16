import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {InsertTextCommand} from "../commands/InsertTextCommand";

/**
 * Handles typing of characters
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCharacterInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget
): void | boolean {
    if (!event.ctrl && !event.alt && (event.type == "down" || event.type == "repeat")) {
        const char = event.key.char;
        if (char) {
            onChange(new InsertTextCommand(textField, char));
            return true;
        }
    }
}

import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {insertText} from "../insertText";

/**
 * Handles typing of characters
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCharacterInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.char && !event.ctrl && !event.alt) {
        insertText(textField, event.key.char);
        return true;
    }
}

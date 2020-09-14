import {ITextField} from "../../_types/ITextField";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles new line inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleNewlineInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is("enter", ["repeat", "down"])) {
        insertText(textField, "\n");
        return true;
    }
}

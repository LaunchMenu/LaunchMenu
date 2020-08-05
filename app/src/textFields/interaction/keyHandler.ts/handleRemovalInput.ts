import {ITextField} from "../../_types/ITextField";
import {removeText} from "../removeText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles text removal inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleRemovalInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is("backspace", ["down", "repeat"])) {
        removeText(textField, -1);
        return true;
    }
    if (event.is("delete", ["down", "repeat"])) {
        removeText(textField, 1);
        return true;
    }
}

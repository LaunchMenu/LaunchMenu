import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {insertText} from "../insertText";

/**
 * Handles new line inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleNewlineInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.name == "enter") {
        insertText(textField, "\n");
        return true;
    }
}

import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {removeText} from "../removeText";

/**
 * Handles text removal inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleRemovalInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.name == "backspace") {
        removeText(textField, -1);
        return true;
    }
    if (event.down && event.key.name == "delete") {
        removeText(textField, 1);
        return true;
    }
}

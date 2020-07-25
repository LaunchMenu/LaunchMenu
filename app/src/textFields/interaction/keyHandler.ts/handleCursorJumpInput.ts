import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {jumpCursor} from "../jumpCursor";

/**
 * Handles cursor jump input (home/end)
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCursorJumpInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.name == "end") {
        jumpCursor(textField, {dx: 1}, event.shift);
        return true;
    }
    if (event.down && event.key.name == "home") {
        jumpCursor(textField, {dx: -1}, event.shift);
        return true;
    }
}

import {ITextField} from "../../_types/ITextField";
import {jumpCursor} from "../jumpCursor";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles cursor jump input (home/end)
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCursorJumpInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is("end")) {
        jumpCursor(textField, {dx: 1}, event.shift);
        return true;
    }
    if (event.is("home")) {
        jumpCursor(textField, {dx: -1}, event.shift);
        return true;
    }
    if (event.is(["ctrl", "a"])) {
        jumpCursor(textField, {dx: -1});
        jumpCursor(textField, {dx: 1}, true);
        return true;
    }
}

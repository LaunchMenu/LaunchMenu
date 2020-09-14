import {ITextField} from "../../_types/ITextField";
import {moveCursorVertical} from "../moveCursorVertical";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles vertical cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleVerticalCursorInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is("up", ["down", "repeat"])) {
        moveCursorVertical(textField, -1, event.shift);
        return true;
    }
    if (event.is("down", ["down", "repeat"])) {
        moveCursorVertical(textField, 1, event.shift);
        return true;
    }
}

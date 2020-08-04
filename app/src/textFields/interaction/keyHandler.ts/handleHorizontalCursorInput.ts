import {ITextField} from "../../_types/ITextField";
import {moveCursorHorizontal} from "../moveCursorHorizontal";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles horizontal cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleHorizontalCursorInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is("left", ["down", "repeat"])) {
        moveCursorHorizontal(textField, -1, event.shift);
        return true;
    }
    if (event.is("right", ["down", "repeat"])) {
        moveCursorHorizontal(textField, 1, event.shift);
        return true;
    }
}

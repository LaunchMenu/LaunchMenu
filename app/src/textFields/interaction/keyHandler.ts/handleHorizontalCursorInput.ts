import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {moveCursorHorizontal} from "../moveCursorHorizontal";

/**
 * Handles horizontal cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleHorizontalCursorInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.name == "leftarrow") {
        moveCursorHorizontal(textField, -1, event.shift);
        return true;
    }
    if (event.down && event.key.name == "rightarrow") {
        moveCursorHorizontal(textField, 1, event.shift);
        return true;
    }
}

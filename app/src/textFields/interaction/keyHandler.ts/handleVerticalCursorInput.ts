import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {moveCursorVertical} from "../moveCursorVertical";

/**
 * Handles vertical cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleVerticalCursorInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.key.name == "uparrow") {
        moveCursorVertical(textField, -1, event.shift);
        return true;
    }
    if (event.down && event.key.name == "downarrow") {
        moveCursorVertical(textField, 1, event.shift);
        return true;
    }
}

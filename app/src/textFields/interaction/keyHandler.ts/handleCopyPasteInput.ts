import {IKeyEvent} from "../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {ITextField} from "../../_types/ITextField";
import {pasteText} from "../pasteText";
import {copyText} from "../copyText";
import {insertText} from "../insertText";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCopyPasteInput(
    event: IKeyEvent,
    textField: ITextField
): void | boolean {
    if (event.down && event.ctrl && event.key.name == "c") {
        copyText(textField);
        return true;
    }
    if (event.down && event.ctrl && event.key.name == "x") {
        copyText(textField);
        insertText(textField, "");
        return true;
    }
    if (event.down && event.ctrl && event.key.name == "v") {
        pasteText(textField);
        return true;
    }
}

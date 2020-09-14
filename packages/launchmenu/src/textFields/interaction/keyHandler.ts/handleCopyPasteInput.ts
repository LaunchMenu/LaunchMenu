import {ITextField} from "../../_types/ITextField";
import {pasteText} from "../pasteText";
import {copyText} from "../copyText";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @returns Whether the event was caught
 */
export function handleCopyPasteInput(
    event: KeyEvent,
    textField: ITextField
): void | boolean {
    if (event.is(["ctrl", "c"])) {
        copyText(textField);
        return true;
    }
    if (event.is(["ctrl", "x"])) {
        copyText(textField);
        insertText(textField, "");
        return true;
    }
    if (event.is(["ctrl", "v"])) {
        pasteText(textField);
        return true;
    }
}

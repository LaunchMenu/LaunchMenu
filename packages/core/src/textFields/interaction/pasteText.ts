import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {insertText} from "./insertText";
import {clipboard} from "electron";

/**
 * Pastes the selected text
 * @param textField The text field ot move the cursor for
 * @param caret The caret to insert the text at
 * @returns Whether any text was pasted
 */
export function pasteText(
    textField: ITextField,
    caret: ITextSelection = textField.getSelection()
): boolean {
    const text = clipboard.readText();
    if (text.length == 0) return false;
    insertText(textField, text, caret);
    return true;
}

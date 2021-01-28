import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {clipboard} from "electron";

/**
 * Copies the selected text
 * @param textField The text field ot move the cursor for
 * @param caret The caret to copy the text from
 * @returns Whether anything was copied
 */
export function copyText(
    textField: ITextField,
    caret: ITextSelection = textField.getSelection()
): boolean {
    const text = textField.get();
    const start = Math.min(caret.start, caret.end);
    const end = Math.max(caret.start, caret.end);
    if (start == end) return false;

    const selectedText = text.slice(start, end);
    clipboard.writeText(selectedText);
    return true;
}

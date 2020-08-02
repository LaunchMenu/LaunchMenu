import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {clipboard} from "electron";

/**
 * Copies the selected text
 * @param textField The text field ot move the cursor for
 * @param caret The caret to copy the text from
 */
export async function copyText(
    textField: ITextField,
    caret: ITextSelection = textField.getSelection()
): Promise<void> {
    const text = textField.get();
    const start = Math.min(caret.start, caret.end);
    const end = Math.max(caret.start, caret.end);
    const selectedText = text.slice(start, end);
    await clipboard.writeText(selectedText);
}

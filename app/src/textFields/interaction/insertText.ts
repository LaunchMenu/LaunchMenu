import {ITextSelection} from "../_types/ITextSelection";
import {ITextField} from "../_types/ITextField";

/**
 * Inserts the given text into the text field
 * @param textField The text field to insert the text into
 * @param text The text to be inserted
 * @param caret The caret to insert the text at
 */
export function insertText(
    textField: ITextField,
    text: string,
    caret: ITextSelection = textField.getSelection()
): void {
    const allText = textField.get();

    const start = Math.min(caret.start, caret.end);
    const end = Math.max(caret.start, caret.end);
    const newText = allText.slice(0, start) + text + allText.slice(end);

    const newCaretPos = start + text.length;

    textField.set(newText);
    textField.setSelection({start: newCaretPos, end: newCaretPos});
}

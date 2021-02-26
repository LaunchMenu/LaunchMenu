import {ITextSelection} from "../_types/ITextSelection";
import {ITextEditTarget} from "./_types/ITextEditTarget";
import {performNormalizedTextEdit} from "./performNormalizedTextEdit";

/**
 * Inserts the given text into the text field
 * @param targetField The text field to insert the text into
 * @param text The text to be inserted
 * @param caret The caret to insert the text at
 */
export function insertText(
    targetField: ITextEditTarget,
    text: string,
    caret?: ITextSelection
): void {
    performNormalizedTextEdit(targetField, textField => {
        if (!caret) caret = textField.getSelection();

        const start = Math.min(caret.start, caret.end);
        const end = Math.max(caret.start, caret.end);
        const newCaretPos = start + text.length;

        return {
            alterations: [{start, end, text}],
            selection: {start: newCaretPos, end: newCaretPos},
        };
    });
}

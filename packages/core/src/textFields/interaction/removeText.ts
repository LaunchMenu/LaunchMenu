import {ITextSelection} from "../_types/ITextSelection";
import {ITextEditTarget} from "./_types/ITextEditTarget";
import {performNormalizedTextEdit} from "./performNormalizedTextEdit";
import {ITextAlterationInput} from "./commands/_types/ITextAlterationInput";

/**
 * Removes text from the text field in the given direction
 * @param targetField The text field to insert the text into
 * @param direction The amount of characters to remove and the direction (-1 == backspace)
 * @param caret The caret to remove the text at
 */
export function removeText(
    targetField: ITextEditTarget,
    direction: number = -1,
    caret?: ITextSelection
): void {
    performNormalizedTextEdit(targetField, textField => {
        if (!caret) caret = textField.getSelection();

        const start = Math.min(caret.start, caret.end);
        const end = Math.max(caret.start, caret.end);

        let newCaretPos = start;
        let alterations: ITextAlterationInput[] = [];

        // If text is currently selected, ignore the direction and just remove it
        if (start != end) alterations = [{start, end, text: ""}];
        // If the direction is backwards remove before the cursor and move the cursor backwards
        else if (direction < 0) {
            alterations = [{start: Math.max(0, start + direction), end, text: ""}];
            newCaretPos = caret.start + direction;
        }
        // If the direction is forwards remove after the cursor
        else alterations = [{start, end: end + direction, text: ""}];

        // Return the nee changes and new selection
        return {alterations, selection: {start: newCaretPos, end: newCaretPos}};
    });
}

import {ITextSelection} from "../_types/ITextSelection";
import {ITextField} from "../_types/ITextField";

/**
 * Removes text from the text field in the given direction
 * @param textField The text field to insert the text into
 * @param direction The amount of characters to remove and the direction (-1 == backspace)
 * @param caret The caret to remove the text at
 */
export function removeText(
    textField: ITextField,
    direction: number = -1,
    caret: ITextSelection = textField.getSelection()
): void {
    const allText = textField.get();

    const start = Math.min(caret.start, caret.end);
    const end = Math.max(caret.start, caret.end);
    let newText: string;
    let newCaretPos = start;
    // If text is currently selected, ignore the direction and just remove it
    if (start != end) newText = allText.slice(0, start) + allText.slice(end);
    // If the direction is backwards remove before the cursor and move the cursor backwards
    else if (direction < 0) {
        newText = allText.slice(0, Math.max(0, start + direction)) + allText.slice(end);
        newCaretPos = caret.start + direction;
    }
    // If the direction is forwards remove after the cursor
    else newText = allText.slice(0, start) + allText.slice(end + direction);

    textField.set(newText);
    textField.setSelection({start: newCaretPos, end: newCaretPos});
}

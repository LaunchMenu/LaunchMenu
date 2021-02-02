import {ITextField} from "../_types/ITextField";
import {getJumpTokenPos} from "./getJumpTokenPos";

/**
 * Moves the cursor horizontally (left or right, positive is right)
 * @param textField The text field ot move the cursor for
 * @param direction The movement direction
 * @param expandSelection Whether to alter the current text selection
 * @param jumpWord Whether to jump a whole word (moving a word incros instead of a character)
 */
export function moveCursorHorizontal(
    textField: ITextField,
    direction: number = 1,
    expandSelection?: boolean,
    jumpWord?: boolean
): void {
    const selection = textField.getSelection();

    // Determine the position to jump to
    let end: number;
    if (jumpWord) end = getJumpTokenPos(textField.get(), selection.end, direction * 2);
    else end = selection.end + direction;

    // If we want to expand the selection, only change the end
    if (expandSelection)
        textField.setSelection({
            start: selection.start,
            end,
        });
    // Otherwise move both to the end index
    else {
        let index: number;
        if (selection.start != selection.end)
            index = Math[direction > 0 ? "max" : "min"](selection.end, selection.start);
        else index = end;

        textField.setSelection({start: index, end: index});
    }
}

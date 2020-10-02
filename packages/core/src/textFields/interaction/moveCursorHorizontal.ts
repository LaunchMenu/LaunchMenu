import {ITextField} from "../_types/ITextField";

/**
 * Moves the cursor horizontally (left or right, positive is right)
 * @param textField The text field ot move the cursor for
 * @param direction The movement direction
 * @param expandSelection Whether to alter the current text selection
 */
export function moveCursorHorizontal(
    textField: ITextField,
    direction: number = 1,
    expandSelection?: boolean
): void {
    const selection = textField.getSelection();
    // If we want to expand the selection, only change the end
    if (expandSelection)
        textField.setSelection({
            start: selection.start,
            end: selection.end + direction,
        });
    // Otherwise move both to the end index
    else {
        let index: number;
        if (selection.start != selection.end)
            index = Math[direction > 0 ? "max" : "min"](selection.end, selection.start);
        else index = selection.end + direction;

        textField.setSelection({start: index, end: index});
    }
}

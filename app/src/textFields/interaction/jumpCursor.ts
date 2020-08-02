import {ITextField} from "../_types/ITextField";
import {get2dIndex, getTextLines, get1dIndex} from "../utils/rangeConversion";

/**
 * Jumps the cursor to the top, bottom, start of line or end of line
 * @param textField The text field ot move the cursor for
 * @param direction The movement direction
 * @param expandSelection Whether to alter the current text selection
 */
export function jumpCursor(
    textField: ITextField,
    direction: {dx?: number; dy?: number},
    expandSelection?: boolean
): void {
    const selection = textField.getSelection();
    const text = textField.get();

    // Get a point representation of the index
    const lines = getTextLines(text, false);
    let endPoint = get2dIndex(text, selection.end);

    // Move the end point
    if (direction.dy) {
        if (direction.dy > 0) endPoint.row = lines.length - 1;
        else endPoint.row = 0;
    }
    if (direction.dx) {
        if (direction.dx > 0) endPoint.column = lines[endPoint.row].length;
        else endPoint.column = 0;
    }

    // Convert back to 1d index representation
    const endIndex = get1dIndex(text, endPoint);

    // Update the selection
    textField.setSelection({
        start: expandSelection ? selection.start : endIndex,
        end: endIndex,
    });
}

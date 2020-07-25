import {ITextField} from "../_types/ITextField";
import {
    get2dIndex,
    get1dIndex,
} from "../../components/fields/editorField/rangeConversion";

/**
 * Moves the cursor vertically (up or down, positive is down)
 * @param textField The text field ot move the cursor for
 * @param direction The movement direction
 * @param expandSelection Whether to alter the current text selection
 */
export function moveCursorVertical(
    textField: ITextField,
    direction: number = 1,
    expandSelection?: boolean
): void {
    const selection = textField.getSelection();
    const text = textField.get();

    // Get a point representation of the index
    let startPoint = get2dIndex(text, selection.start);
    let endPoint = get2dIndex(text, selection.end);

    // If we want to expand the selection, only change the end
    if (expandSelection) endPoint.row += direction;
    // Otherwise move both to the end index
    else {
        let point: {row: number; column: number};
        if (selection.start != selection.end) {
            if (direction > 0 == selection.end > selection.start) point = endPoint;
            else point = startPoint;
        } else point = endPoint;

        point.row += direction;
        startPoint = endPoint = point;
    }
    console.log(endPoint);

    // Convert back to 1d index representation
    const startIndex = get1dIndex(text, startPoint);
    const endIndex = get1dIndex(text, endPoint);

    // Update the selection
    textField.setSelection({start: startIndex, end: endIndex});
}

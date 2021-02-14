import {get1dIndex, get2dIndex, getTextLines} from "../../utils/rangeConversion";
import {ITextField} from "../../_types/ITextField";
import {ITextSelection} from "../../_types/ITextSelection";

/**
 * Indents or dedents the selected text in the
 * @param textField The text field to indent or dedent the text of
 * @param indent The indentation amount, negative to dedent
 * @param indentCharacter The character to indent or dedent by
 * @param caret The caret to insert the text at
 */
export function indentText(
    textField: ITextField,
    indent: number,
    indentCharacter: string = " ".repeat(4),
    caret: ITextSelection = textField.getSelection(),
    updateCaret: boolean = true
): void {
    const text = textField.get();
    const lines = getTextLines(text);

    // Get a 2d selection
    const startPoint = get2dIndex(text, caret.start);
    const endPoint = get2dIndex(text, caret.end);
    const startRow = Math.min(startPoint.row, endPoint.row);
    const endRow = Math.max(startPoint.row, endPoint.row);

    // Indent or dedent every line in the selection
    const indentedLines = lines.map((line, i) => {
        // If the line isn't in range, don't alter it
        if (i < startRow || i > endRow) return line;
        const orLine = line;

        // Indent the line if specified
        let indentLine = indent;
        while (indentLine > 0) {
            indentLine--;
            line = indentCharacter + line;
        }

        // Dedent the line if specified
        while (
            indentLine < 0 &&
            line.slice(0, indentCharacter.length) == indentCharacter
        ) {
            indentLine++;
            line = line.slice(indentCharacter.length);
        }

        // Dedent remaining space or other characters if some are left
        if (indentLine < 0) {
            for (let length = indentCharacter.length; length > 0; length--) {
                if (line.slice(0, length) == indentCharacter.slice(0, length)) {
                    line = line.slice(length);
                    break;
                }
            }
        }

        // Move the caret if on this line
        if (startPoint.row == i)
            startPoint.column = Math.max(
                0,
                startPoint.column + (line.length - orLine.length)
            );
        if (endPoint.row == i)
            endPoint.column = Math.max(
                0,
                endPoint.column + (line.length - orLine.length)
            );

        // Return the adjusted line
        return line;
    });

    // Update the field
    const newText = indentedLines.join("");
    textField.set(newText);

    // Update the selection
    if (updateCaret) {
        const startIndex = get1dIndex(newText, startPoint);
        const endIndex = get1dIndex(newText, endPoint);
        textField.setSelection({start: startIndex, end: endIndex});
    }
}

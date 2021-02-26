import {get1dIndex, get2dIndex, getTextLines} from "../../utils/rangeConversion";
import {ITextSelection} from "../../_types/ITextSelection";
import {ITextAlteration} from "../commands/_types/ITextAlteration";
import {performNormalizedTextEdit} from "../performNormalizedTextEdit";
import {ITextEditTarget} from "../_types/ITextEditTarget";

/**
 * Indents or dedents the selected text in the
 * @param targetField The text field to indent or dedent the text of
 * @param indent The indentation amount, negative to dedent
 * @param indentCharacter The character to indent or dedent by
 * @param caret The caret to insert the text at
 */
export function indentText(
    targetField: ITextEditTarget,
    indent: number,
    indentCharacter: string = " ".repeat(4),
    caret?: ITextSelection,
    updateCaret: boolean = true
): void {
    performNormalizedTextEdit(targetField, textField => {
        if (!caret) caret = textField.getSelection();
        const text = textField.get();
        const lines = getTextLines(text);

        // Get a 2d selection
        const startPoint = get2dIndex(text, caret.start);
        const endPoint = get2dIndex(text, caret.end);
        const startRow = Math.min(startPoint.row, endPoint.row);
        const endRow = Math.max(startPoint.row, endPoint.row);

        // Retrieve the changes to indent or dedent each line
        let lineStart = 0;
        const changes = lines.map((line, i) => {
            // If the line isn't in range, don't alter it
            if (i < startRow || i > endRow) {
                lineStart += line.length;
                return {change: undefined, newLine: line};
            }
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
            const lineDelta = line.length - orLine.length;
            if (startPoint.row == i)
                startPoint.column = Math.max(0, startPoint.column + lineDelta);
            if (endPoint.row == i)
                endPoint.column = Math.max(0, endPoint.column + lineDelta);

            // Return the adjusted line
            const lineData = {
                change:
                    lineDelta > 0
                        ? {
                              start: lineStart,
                              end: lineStart,
                              text: line.substring(0, lineDelta),
                          }
                        : {start: lineStart, end: lineStart - lineDelta, text: ""},
                newLine: line,
            };
            lineStart += orLine.length; // Increase the lineStart index, for the next iteration
            return lineData;
        });

        // Extract both the new text and the alterations from the change data
        const alterations = changes
            .map(({change}) => change)
            .filter((change): change is ITextAlteration => !!change);
        const newText = changes.map(({newLine}) => newLine).join("");

        // Calculate the new selection
        let selection: ITextSelection | undefined;
        if (updateCaret) {
            const startIndex = get1dIndex(newText, startPoint);
            const endIndex = get1dIndex(newText, endPoint);
            selection = {start: startIndex, end: endIndex};
        }

        return {alterations, selection};
    });
}

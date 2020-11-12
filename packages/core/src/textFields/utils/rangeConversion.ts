import type {Ace} from "ace-builds";
import {getAce} from "../../components/fields/editorField/getAce";
import {ITextSelection} from "../_types/ITextSelection";

/**
 * Splits the text into its lines
 * @param text The text to split
 * @param includeEndings Whether to include line endings in the lines
 * @returns The split text
 */
export function getTextLines(text: string, includeEndings: boolean = true): string[] {
    if (!includeEndings) return text.split(/\r?\n/);

    const results = [] as string[];
    const tokens = text.split(/(\r?\n)/);
    for (let i = 0; i < tokens.length; i += 2)
        results.push(tokens[i] + (i + 1 < tokens.length ? tokens[i + 1] : ""));
    return results;
}

/**
 * Creates a valid 2 dimensional index in the given text
 * @param text The text to perform the conversion with
 * @param index The 1 dimensional index
 * @returns The 2 dimensional index
 */
export function get2dIndex(text: string, index: number): {row: number; column: number} {
    const lines = getTextLines(text);
    let row = 0;
    let length;
    while ((length = lines[row].length) <= index && row < lines.length - 1) {
        index -= length;
        row++;
    }
    return {row, column: index};
}

/**
 * Creates a valid 2 dimensional range from a given 1 dimensional selection
 * @param text The text to perform the conversion with
 * @param selection The 1 dimensional selection
 * @returns The 2 dimensional selection range
 */
export function get2dSelectionRange(text: string, selection: ITextSelection): Ace.Range {
    const start = get2dIndex(text, selection.start);
    const end = get2dIndex(text, selection.end);
    return new (getAce().Range)(start.row, start.column, end.row, end.column);
}

/**
 * Creates a valid 1 dimensional index in the given text
 * @param text The text to perform the conversion with
 * @param index The 2 dimensional index
 * @returns The 1 dimensional index
 */
export function get1dIndex(text: string, index: {row: number; column: number}): number {
    const lines = getTextLines(text);
    const endinglessLines = getTextLines(text, false);
    let row = index.row;
    let out = Math.min(Math.max(0, endinglessLines[row]?.length || 0), index.column);
    while (row > 0) out += lines[--row]?.length || 0;
    return out;
}

/**
 * Creates a valid 1 dimensional range from a given 2 dimensional selection
 * @param text The text to perform the conversion with
 * @param selection The 2 dimensional selection
 * @param reverse Whether the selection started at the end index
 * @returns The 1 dimensional selection range
 */
export function get1dSelectionRange(
    text: string,
    selection: Ace.Range,
    reverse?: boolean
): ITextSelection {
    const startIndex = get1dIndex(text, selection.start);
    const endIndex = get1dIndex(text, selection.end);
    return reverse
        ? {
              start: endIndex,
              end: startIndex,
          }
        : {
              start: startIndex,
              end: endIndex,
          };
}

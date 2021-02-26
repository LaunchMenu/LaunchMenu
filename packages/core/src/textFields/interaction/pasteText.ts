import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {insertText} from "./insertText";
import {clipboard} from "electron";
import {ITextEditTarget} from "./_types/ITextEditTarget";

/**
 * Pastes the selected text
 * @param targetField The text field ot move the cursor for
 * @param caret The caret to insert the text at
 * @returns Whether any text was pasted
 */
export function pasteText(targetField: ITextEditTarget, caret?: ITextSelection): boolean {
    const text = clipboard.readText();
    if (text.length == 0) return false;
    insertText(targetField, text, caret);
    return true;
}

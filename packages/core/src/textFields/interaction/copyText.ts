import {ITextField} from "../_types/ITextField";
import {clipboard} from "electron";
import {standardTextResource} from "./commands/TextEditCommand";

/**
 * Copies the selected text
 * @param textField The text field ot move the cursor for
 * @returns Whether anything was copied
 */
export async function copyText(textField: ITextField): Promise<boolean> {
    const release = await (textField.resource || standardTextResource).acquire();

    try {
        const text = textField.get();
        const selection = textField.getSelection();
        const start = Math.min(selection.start, selection.end);
        const end = Math.max(selection.start, selection.end);
        if (start == end) return false;

        const selectedText = text.slice(start, end);
        clipboard.writeText(selectedText);

        return true;
    } finally {
        release();
    }
}

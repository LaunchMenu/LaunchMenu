import {clipboard} from "electron";
import {ITextField} from "../../_types/ITextField";
import {InsertTextCommand} from "./InsertTextCommand";

/** A command to paste text at the caret */
export class PasteTextCommand extends InsertTextCommand {
    /** A promises that resolves whether any text was present to paste */
    public readonly pasted = new Promise<boolean>(resolve => {
        this.resolve = resolve;
    });
    protected resolve?: (pasted: boolean) => void;

    /**
     * Creates a new command to paste the copied text
     * @param targetField The text field to paste the text in
     */
    public constructor(textField: ITextField) {
        super(textField, () => {
            const text = clipboard.readText();
            this.resolve?.(text.length != 0);
            return text;
        });
    }
}

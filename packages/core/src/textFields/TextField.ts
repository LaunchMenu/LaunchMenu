import {Field, IDataHook} from "model-react";
import {ITextSelection} from "./_types/ITextSelection";
import {ITextField} from "./_types/ITextField";

/**
 * A mutable field to contain a text input as well as the selected range
 */
export class TextField implements ITextField {
    protected selection = new Field({start: 0, end: 0});
    protected text: Field<string>;

    /**
     * Creates a new TextField that stores text and selection data
     * @param text The initial text to store
     * @param selection The selected text
     */
    public constructor(text: string = "", selection?: ITextSelection) {
        this.text = new Field(text);
        if (selection) this.selection.set(selection);
    }

    /**
     * Sets the value of the text field
     * @param text The new text
     */
    public set(text: string): void {
        this.text.set(text);
        const selection = this.selection.get(null);
        if (selection.end > text.length || selection.start > text.length)
            this.selection.set({
                start: Math.min(selection.start, text.length),
                end: Math.min(selection.end, text.length),
            });
    }

    /**
     * Retrieves the value of the text field
     * @param hook The hook to subscribe to changes
     * @returns The current text
     */
    public get(hook: IDataHook = null): string {
        return this.text.get(hook);
    }

    /**
     * Sets the selection range
     * @param selection The new selection
     */
    public setSelection(selection: ITextSelection): void {
        const text = this.text.get(null);
        const start = Math.max(0, Math.min(selection.start, text.length));
        const end = Math.max(0, Math.min(selection.end, text.length));

        const current = this.selection.get(null);
        if (current.start != start || current.end != end)
            this.selection.set({start, end});
    }

    /**
     * Retrieves the selected range (or cursor if start==end)
     * @param hook The hook to subscribe to changes
     * @returns The selected range
     */
    public getSelection(hook: IDataHook = null): ITextSelection {
        return this.selection.get(hook);
    }
}

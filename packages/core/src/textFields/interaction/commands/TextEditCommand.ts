import {Command} from "../../../undoRedo/Command";
import {Resource} from "../../../undoRedo/dependencies/Resource";
import {ITextField} from "../../_types/ITextField";
import {ITextAlteration} from "./_types/ITextAlteration";
import {ITextEditCommand} from "./_types/ITextEditCommand";
import {ITextEditData} from "./_types/ITextEditData";
import {ITextFieldChangeRetriever} from "./_types/ITextFieldChangeRetriever";

/** A  base command that can be used to edit textfields */
export class TextEditCommand extends Command implements ITextEditCommand {
    public metadata = {
        name: "Edit text",
    };
    protected readonly dependencies = [standardTextResource] as Resource[];

    protected target: ITextField;
    protected change: ITextFieldChangeRetriever;

    protected data?: ITextEditData;

    protected addedText?: string;
    protected selectionChange: boolean;

    /**
     * Creates a new text edit command
     * @param target The field of which to alter the text
     * @param change The function to retrieve the new contents of the text field
     * @param type The type of the command, used for undo/redo merging
     */
    public constructor(
        target: ITextField,
        change: ITextFieldChangeRetriever,
        type: {addedText?: string; isSelectionChange?: boolean} = {}
    ) {
        super();
        this.target = target;

        if ("resource" in target && target.resource)
            this.dependencies = [target.resource];

        this.change = change;

        this.addedText = type.addedText;
        this.selectionChange = type.isSelectionChange ?? false;
    }

    /**
     * Uses the change function to compute the new text and selection for the field
     */
    protected computeChange(): ITextEditData {
        const oldText = this.target.get();
        const oldSelection = this.target.getSelection();

        const change = this.change({selection: oldSelection, text: oldText});
        const alteration: ITextAlteration | undefined = change.text
            ? {
                  ...change.text,
                  prevContent: oldText.substring(change.text.start, change.text.end),
              }
            : undefined;
        this.addedText = alteration?.content || undefined;

        const newText = change.text
            ? oldText.substring(0, change.text.start) +
              change.text.content +
              oldText.substring(change.text.end)
            : oldText;
        const newSelection = change.selection ?? oldSelection;

        return {
            oldText,
            oldSelection,
            newText,
            newSelection,
            alteration,
        };
    }

    /** @override */
    protected onExecute(): void {
        // Compute the data for execution (and reverting)
        if (this.data == undefined) {
            this.data = this.computeChange();
        }

        // Set the new value
        this.target.set(this.data.newText);
        this.target.setSelection(this.data.newSelection);
    }

    /** @override */
    protected onRevert(): void {
        if (this.data) {
            this.target.set(this.data.oldText);
            this.target.setSelection(this.data.oldSelection);
        }
    }

    // Getters
    /** @override */
    public getAddedText(): string | undefined {
        return this.addedText;
    }

    /** @override */
    public isSelectionChange(): boolean {
        return this.selectionChange;
    }

    /** @override */
    public getAlterations(): ITextAlteration[] {
        return this.data?.alteration ? [this.data?.alteration] : [];
    }
}

/** A standard resource for text editing */
export const standardTextResource = new Resource("Text edit");

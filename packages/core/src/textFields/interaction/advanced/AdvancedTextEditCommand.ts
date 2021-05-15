import {Command} from "../../../undoRedo/Command";
import {Resource} from "../../../undoRedo/dependencies/Resource";
import {ITextField} from "../../_types/ITextField";
import {ITextSelection} from "../../_types/ITextSelection";
import {standardTextResource} from "../commands/TextEditCommand";
import {ITextAlteration} from "../commands/_types/ITextAlteration";
import {ITextEditCommand} from "../commands/_types/ITextEditCommand";
import {IAdvancedTextEditData} from "./_types/IAdvancedTextEditData";
import {IAdvancedTextFieldChangeRetriever} from "./_types/IAdvancedTextFieldChangeRetriever";

/** A base command to make a more advanced text edit command composed of multiple commands */
export class AdvancedTextEditCommand extends Command implements ITextEditCommand {
    public metadata = {
        name: "Edit text",
    };
    protected readonly dependencies = [standardTextResource] as Resource[];

    protected target: ITextField;
    protected change: IAdvancedTextFieldChangeRetriever;

    protected data?: IAdvancedTextEditData;

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
        change: IAdvancedTextFieldChangeRetriever,
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
    protected computeChange(): IAdvancedTextEditData {
        const oldText = this.target.get();
        const oldSelection = this.target.getSelection();

        const change = this.change({selection: oldSelection, text: oldText});
        const textChanges = change.text ? [...change.text] : [];
        textChanges.sort((a, b) => a.end - b.end);

        const alterations: ITextAlteration[] = textChanges.map(change => ({
            ...change,
            prevContent: oldText.substring(change.start, change.end),
        }));
        this.addedText = alterations.map(({content}) => content).join("");

        const newText = alterations.reduceRight(
            (newText, {start, end, content}) =>
                newText.slice(0, start) + content + newText.slice(end),
            oldText
        );
        const newSelection = change.selection ?? oldSelection;

        return {
            oldText,
            oldSelection,
            newText,
            newSelection,
            alterations,
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
        return this.data?.alterations ?? [];
    }
}

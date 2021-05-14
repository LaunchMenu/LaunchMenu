import {Command} from "../../../undoRedo/Command";
import {Resource} from "../../../undoRedo/dependencies/Resource";
import {wait} from "../../../_tests/wait.helper";
import {IField} from "../../../_types/IField";
import {ITextField} from "../../_types/ITextField";
import {ITextSelection} from "../../_types/ITextSelection";
import {TextAlterationTools} from "./TextAlterationTools";
import {ITextAlteration} from "./_types/ITextAlteration";
import {ITextAlterationInput} from "./_types/ITextAlterationInput";
import {ITextEditCommand} from "./_types/ITextEditCommand";

/** A  base command that can be used to edit textfields */
export class TextEditCommand extends Command implements ITextEditCommand {
    public metadata = {
        name: "Edit text",
    };
    protected readonly dependencies = [standardTextResource] as Resource[];

    protected target: IField<string> | ITextField;
    protected alterationInput: ITextAlterationInput;
    protected alteration?: ITextAlteration;

    protected oldSelection?: ITextSelection;
    protected oldText?: string;

    protected newSelection?: ITextSelection;
    protected newText?: string;

    /**
     * Creates a new text edit command
     * @param target The field of which to alter the text
     * @param alteration The change to make in the text, where indices correspond to indices in the original text
     */
    public constructor(target: IField<string>, alteration: ITextAlterationInput);
    /**
     * Creates a new text edit command
     * @param target The field of which to alter the text
     * @param alteration The change to make in the text, where indices correspond to indices in the original text
     * @param selection The selection after executing this command
     */
    public constructor(
        target: ITextField,
        alterations: ITextAlterationInput,
        selection?: ITextSelection
    );
    public constructor(
        target: IField<string> | ITextField,
        alteration: ITextAlterationInput,
        selection?: ITextSelection
    ) {
        super();
        this.target = target;
        this.alterationInput = alteration;
        this.newSelection = selection;

        if ("resource" in target && target.resource)
            this.dependencies = [target.resource];
    }

    /**
     * Retrieves the alteration made by this command, the `prevText` is only stable if the command is already executed
     * @returns The alteration
     */
    public getAlterations(): ITextAlteration[] {
        if (!this.alteration) {
            const text = this.oldText ?? this.target.get();
            this.alteration = {
                ...this.alterationInput,
                prevText: text.substring(
                    this.alterationInput.start,
                    this.alterationInput.end
                ),
            };
        }
        return [this.alteration];
    }

    /**
     * Retrieves the text selection after executing this command
     * @returns The text selection
     */
    public getSelection(): ITextSelection | undefined {
        return this.newSelection;
    }

    /**
     * Retrieves the text target
     * @returns The field to change the text of
     */
    public getTarget(): ITextField | IField<string> {
        return this.target;
    }

    /**
     * Retrieves the text that this command will be executed on, or was executed on
     * @returns The text that this command is/was executed on
     */
    public getTargetText(): string {
        return this.oldText ?? this.target.get();
    }

    /**
     * Retrieves the selection that the target has/had before this command executed
     * @returns The selection that was present before execution of this command
     */
    public getTargetSelection(): ITextSelection | undefined {
        return (
            this.oldSelection ??
            ("getSelection" in this.target ? this.target.getSelection() : undefined)
        );
    }

    // Text alteration
    /**
     * Retrieves the new text of the field based on the current text and the changes
     */
    protected getNewText(): string {
        if (this.newText != undefined) return this.newText;

        let text = TextAlterationTools.performAlterations(this.target.get(), [
            this.alterationInput,
        ]);
        this.newText = text;
        return text;
    }

    /** @override */
    protected onExecute(): void {
        // Store the old value
        if (this.oldText == undefined) {
            this.alteration = undefined;
            this.oldText = this.target.get();
            if ("getSelection" in this.target)
                this.oldSelection = this.target.getSelection();
        }

        // Set the new value
        this.target.set(this.getNewText());
        if (this.newSelection && "setSelection" in this.target)
            this.target.setSelection(this.newSelection);
    }

    /** @override */
    protected onRevert(): void {
        if (this.oldText != undefined) this.target.set(this.oldText);
        if (this.oldSelection != undefined && "setSelection" in this.target)
            this.target.setSelection(this.oldSelection);
    }
}

/** A standard resource for text editing */
export const standardTextResource = new Resource("Text edit");

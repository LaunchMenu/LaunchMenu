import {Command} from "../../../undoRedo/Command";
import {IField} from "../../../_types/IField";
import {ITextField} from "../../_types/ITextField";
import {ITextSelection} from "../../_types/ITextSelection";
import {ITextAlteration} from "./_types/ITextAlteration";
import {ITextAlterationInput} from "./_types/ITextAlterationInput";

/** A  base command that can be used to edit textfields */
export class TextEditCommand extends Command {
    public metadata = {
        name: "Edit text",
    };

    protected target: IField<string> | ITextField;
    protected alterationsInput: ITextAlterationInput[];
    protected alterations?: ITextAlteration[];

    protected oldSelection?: ITextSelection;
    protected oldText?: string;

    protected newSelection?: ITextSelection;
    protected newText?: string;

    /**
     * Creates a new text edit command
     * @param target The field of which to alter the text
     * @param alterations The changes to make in the text, where indices correspond to indices in the original text
     */
    public constructor(target: IField<string>, alterations: ITextAlterationInput[]);
    /**
     * Creates a new text edit command
     * @param target The field of which to alter the text
     * @param alterations The changes to make in the text, where indices correspond to indices in the original text
     * @param selection The selection after executing this command
     */
    public constructor(
        target: ITextField,
        alterations: ITextAlterationInput[],
        selection?: ITextSelection
    );
    public constructor(
        target: IField<string> | ITextField,
        alterations: ITextAlterationInput[],
        selection?: ITextSelection
    ) {
        super();
        this.target = target;
        this.alterationsInput = alterations.sort(({start: a}, {start: b}) => a - b);
        this.newSelection = selection;

        if (this.alterationsInput.some((item, i, all) => item.end > all[i + 1]?.start))
            throw Error(
                "Alterations may not overlap each other, use a compound command instead"
            );
    }

    /**
     * Retrieves all alterations made by this command, the `prevText` is only stable if the command is already executed
     * @returns The changes sorted by start index
     */
    public getAlterations(): ITextAlteration[] {
        if (!this.alterations) {
            const text = this.oldText ?? this.target.get();
            this.alterations = this.alterationsInput.map(alteration => ({
                ...alteration,
                prevText: text.substring(alteration.start, alteration.end),
            }));
        }
        return this.alterations;
    }

    /**
     * Retrieves the new text of the field based on the current text and the changes
     */
    protected getNewText(): string {
        if (this.newText != undefined) return this.newText;

        let text = TextEditCommand.performAlterations(
            this.target.get(),
            this.alterationsInput
        );
        this.newText = text;
        return text;
    }

    /** @override */
    protected async onExecute(): Promise<void> {
        // Store the old value
        if (this.oldText == undefined) {
            this.alterations = undefined;
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
    protected async onRevert(): Promise<void> {
        if (this.oldText != undefined) this.target.set(this.oldText);
        if (this.oldSelection != undefined && "setSelection" in this.target)
            this.target.setSelection(this.oldSelection);
    }

    /**
     * Performs the specified alterations on a piece of text
     * @param text The text to perform the alterations on
     * @param alterations The alterations to perform
     * @returns The obtained text
     *
     * @remarks
     * Since this currently just uses string concatenation, it's not super efficient for big input.
     * In the future arrays and join could be used, making it faster for big inputs, but it would make things slower for small inputs.
     */
    public static performAlterations(
        text: string,
        alterations: ITextAlterationInput[]
    ): string {
        return alterations.reduceRight(
            (newText, {start, end, text}) =>
                newText.slice(0, start) + text + newText.slice(end),
            text
        );
    }
}

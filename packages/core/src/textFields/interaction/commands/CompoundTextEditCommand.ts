import {Command} from "../../../undoRedo/Command";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {ICompoundCommand} from "../../../undoRedo/_types/ICompoundCommand";
import {IField} from "../../../_types/IField";
import {ITextField} from "../../_types/ITextField";
import {ITextSelection} from "../../_types/ITextSelection";
import {TextAlterationTools} from "./TextAlterationTools";
import {ITextAlteration} from "./_types/ITextAlteration";
import {ITextAlterationInput} from "./_types/ITextAlterationInput";
import {ITextEditCommand} from "./_types/ITextEditCommand";

// TODO: this command can be improved quite a bit, especially in how it deals with its state

/** A compound command for text edit commands */
export class CompoundTextEditCommand
    extends Command
    implements ITextEditCommand, ICompoundCommand {
    public metadata = {
        name: "Compound edit text",
    };

    public readonly commands: ITextEditCommand[];

    protected target: IField<string> | ITextField;

    protected alterations?: ITextAlteration[];

    protected oldSelection?: ITextSelection;
    protected oldText?: string;

    protected alterationInputs: ITextAlterationInput[];
    protected newSelection?: ITextSelection;
    protected newText?: string;

    /**
     * Creates a new text edit compound command
     * @param commands The commands to be executed
     */
    public constructor(commands: [ITextEditCommand, ...ITextEditCommand[]]) {
        super();
        this.commands = commands;
        this.target = commands[0].getTarget();
        if (commands.some(command => command.getTarget() != this.target))
            throw new Error(
                "All commands should have the same text target, use a regular compound command instead"
            );

        const combined = this.combineCommands(commands);
        this.newSelection = combined.selection;
        this.alterationInputs = combined.alterations;

        if (
            commands.every(command =>
                ["preparingForExecution", "executing", "executed"].includes(
                    command.getState()
                )
            )
        )
            this.state.set("executed");
    }

    /**
     * Combines the given commands
     * @param commands The commands to be combined
     * @returns The combined commands alterations and selection
     */
    protected combineCommands(
        commands: ITextEditCommand[]
    ): {alterations: ITextAlterationInput[]; selection?: ITextSelection} {
        const combineCommands = commands.slice(1);
        const firstCommand = commands[0];

        // Combine the commands
        const {alterations, selection} = combineCommands.reduce(
            ({executed, alterations, selection}, command) => {
                const newExecuted = command.getState() != "ready";
                if (newExecuted && !executed)
                    throw new Error(
                        "You can't add any commands that have already been executed after non executed commands"
                    );

                // Compute the new selection
                const commandSelection = command.getSelection();
                if (commandSelection) {
                    if (!selection) selection = commandSelection;
                    else {
                        const min = Math.min(
                            commandSelection.start,
                            commandSelection.end
                        );
                        const max = Math.max(
                            commandSelection.start,
                            commandSelection.end
                        );
                        if (selection.start < selection.end)
                            selection = {
                                start: Math.min(min, selection.start),
                                end: Math.max(max, selection.end),
                            };
                        else
                            selection = {
                                start: Math.min(min, selection.end),
                                end: Math.max(max, selection.start),
                            };
                    }
                }

                // Return the new alterations and selection
                return {
                    executed: newExecuted,
                    alterations: TextAlterationTools.mergeAlterations(
                        alterations,
                        command.getAlterations(),
                        newExecuted
                    ),
                    selection,
                };
            },
            {
                executed: firstCommand.getState() != "ready",
                alterations: firstCommand.getAlterations(),
                selection: firstCommand.getSelection(),
            }
        );

        // If the first command was already executed, copy its initial selection and text
        // Store the old value
        if (firstCommand.getState() != "ready") {
            this.oldText = firstCommand.getTargetText();
            if ("getSelection" in this.target)
                this.oldSelection = firstCommand.getTargetSelection();
        }

        // Return the result
        return {alterations, selection};
    }

    //
    /**
     * Retrieves all alterations made by this command
     * @returns The changes in any order, with potential overlap
     */
    public getAlterations(): ITextAlteration[] {
        if (!this.alterations) {
            const inpText = this.oldText ?? this.target.get();
            this.alterations =
                this.alterationInputs?.map(({start, end, text}) => ({
                    start,
                    end,
                    text,
                    prevText: inpText.substring(start, end),
                })) ?? [];
        }
        return this.alterations;
    }

    /**
     * Retrieves the text selection after executing this command
     * @returns The text selection
     */
    public getSelection(): ITextSelection | undefined {
        return undefined;
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
        return this.oldText ?? this.getTarget().get();
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

    // Command execution
    /**
     * Retrieves the new text of the field based on the current text and the changes
     */
    protected getNewText(): string {
        if (this.newText != undefined) return this.newText;

        let text = TextAlterationTools.performAlterations(
            this.target.get(),
            this.alterationInputs
        );
        this.newText = text;
        return text;
    }

    /** @override */
    protected onExecute(): void {
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
    protected onRevert(): void {
        if (this.oldText != undefined) this.target.set(this.oldText);
        if (this.oldSelection != undefined && "setSelection" in this.target)
            this.target.setSelection(this.oldSelection);
    }

    // Compound command tools
    /**
     * Retrieves a new compound command that's equivalent to this command with the specified command added
     * @param command The command to add
     * @returns The new compound command
     */
    public augment(command: ITextEditCommand): CompoundTextEditCommand;

    /**
     * Retrieves a new compound command that's equivalent to this command with the specified command added
     * @param command The command to add
     * @returns The new compound command
     */
    public augment(command: ICommand): CompoundCommand;
    public augment(
        command: ICommand | ITextEditCommand
    ): CompoundCommand | CompoundTextEditCommand {
        if ("getAlterations" in command && command.getTarget() == this.getTarget()) {
            return new CompoundTextEditCommand([this, command]);
        }
        return new CompoundCommand(this.metadata, [...this.commands, command]);
    }
}

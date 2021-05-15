import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommandMetadata} from "../../../undoRedo/_types/ICommandMetadata";
import {ITextAlteration} from "./_types/ITextAlteration";
import {ITextEditCommand} from "./_types/ITextEditCommand";

/** A compound command that tracks the additional text command data */
export class CompoundTextEditCommand extends CompoundCommand implements ITextEditCommand {
    public readonly commands: ITextEditCommand[];

    /**
     * Creates a new compound text command
     * @param commands The text edit commands
     * @param metadata The meta data for this command
     */
    public constructor(
        commands: ITextEditCommand[],
        metadata: ICommandMetadata = {name: "Text edit command"}
    ) {
        super(metadata, commands);
    }

    /**
     * Retrieves a new compound command that's equivalent to this command with the specified command added
     * @param command The command to add
     * @returns The new compound command
     */
    public augment(command: ITextEditCommand): CompoundTextEditCommand {
        return new CompoundTextEditCommand([...this.commands, command], this.metadata);
    }

    // Getters
    /** @override */
    public getAddedText(): string | undefined {
        const texts = this.commands
            .map(cmd => cmd.getAddedText())
            .filter((text): text is string => text !== undefined);
        return texts.length > 0 ? texts.join("") : undefined;
    }

    /** @override */
    public isSelectionChange(): boolean {
        return this.commands.every(cmd => cmd.isSelectionChange());
    }

    /** @override */
    public getAlterations(): ITextAlteration[] {
        return this.commands.flatMap(cmd => cmd.getAlterations());
    }
}

import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {TextEditCommand} from "./TextEditCommand";
import {ITextAlteration} from "./_types/ITextAlteration";

/** A compound command for text edit commands */
export class CompoundTextEditCommand extends CompoundCommand {
    public readonly commands: TextEditCommand[];

    /**
     * Creates a new text edit compound command
     * @param commands The commands to be executed
     */
    public constructor(commands: TextEditCommand[]) {
        super({name: "Text edit compound command"}, commands);
    }

    /**
     * Retrieves all alterations made by this command
     * @returns The changes in any order, with potential overlap
     */
    public getAlterations(): ITextAlteration[] {
        return this.commands.flatMap(command => command.getAlterations());
    }
}

import {ICommand} from "./ICommand";

/**
 * A command that can be augmented with other commands
 */
export type ICompoundCommand = ICommand & {
    /**
     * Retrieves a new compound command that's equivalent to this command with the specified command added
     * @param command The command to add
     * @returns The new compound command
     */
    augment(command: ICommand): ICompoundCommand;
};

/**
 * Checks whether the given command is a compound command
 * @param command The command to check
 * @returns Checks whether a given command is a compound command
 */
export function isCompoundCommand(
    command: ICommand | ICompoundCommand
): command is ICompoundCommand {
    return "augment" in command;
}

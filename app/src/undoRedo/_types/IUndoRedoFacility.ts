import {ICommand} from "./ICommand";
import {IDataHook} from "model-react";
import {ICommandsList} from "./ICommandsList";

/**
 * An undo redo facility type to control the execution of commands
 */
export type IUndoRedoFacility = {
    /**
     * Executes a given command
     * @param command The command to be executed
     * @param addToBatch Whether to batch this command with the previous command(s)
     * @returns A promise that resolves when the command finishes executing
     */
    execute(
        command: ICommand,
        addToBatch?: boolean | ((previous: ICommand) => boolean)
    ): Promise<void>;

    /**
     * Makes sure the next executed command is not batched with the previous command,
     * even if the command specifies to be batched.
     */
    splitBatch(): void; // Equivalent of execute(EmptyCommand, false)

    /**
     * Steps 1 command back into the history
     * @returns A promise that resolves once the command is undone
     */
    undo(): Promise<void>;

    /**
     * Steps 1 command forward into the history
     * @returns A promise that resolves once the command is redone
     */
    redo(): Promise<void>;

    /**
     * Retrieves the state of the undo redo facility
     * @param hook The hook to subscribe to changes
     * @returns The current command facility state
     */
    getState(hook?: IDataHook): IUndoRedoFacilityState;

    /**
     * Retrieves all commands currently stored in the facility
     * @param hook The hook to subscribe to changes
     * @returns The currently stored commands
     */
    getCommand(hook?: IDataHook): ICommandsList;
};

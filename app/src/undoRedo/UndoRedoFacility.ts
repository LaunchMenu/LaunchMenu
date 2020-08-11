import {IUndoRedoFacility} from "./_types/IUndoRedoFacility";
import {ICommand} from "./_types/ICommand";
import {IDataHook, Field} from "model-react";

export class UndoRedoFacility implements IUndoRedoFacility {
    protected state = new Field("ready" as IUndoRedoFacilityState);
    protected undoStack: ICommand[] = [];
    protected redoStack: ICommand[] = [];

    /**
     * Executes a given command
     * @param command The command to be executed
     * @param addToBatch Whether to batch this command with the previous command(s)
     * @returns A promise that resolves when the command finishes executing
     */
    public async execute(
        command: ICommand,
        addToBatch?: boolean | ((previous: ICommand) => boolean)
    ): Promise<void> {}

    /**
     * Executes the given command and updates all state data
     * @param command The command to execute
     */
    protected executeCommand(command: ICommand) {
        this.redoStack = [];
        this.undoStack.push(command);
    }

    /**
     * Reverts the given command and updates all state data
     * @param command The command to revert
     */
    protected revertCommand(command: ICommand) {

    }

    /**
     * Makes sure the next executed command is not batched with the previous command,
     * even if the command specifies to be batched.
     * Alias of execute(EmptyCommand, false).
     */
    public splitBatch(): void {}

    /**
     * Steps 1 command back into the history
     * @returns A promise that resolves once the command is undone
     */
    public async undo(): Promise<void> {}

    /**
     * Steps 1 command forward into the history
     * @returns A promise that resolves once the command is redone
     */
    public async redo(): Promise<void> {}

    /**
     * Retrieves the state of the undo redo facility
     * @param hook The hook to subscribe to changes
     * @returns The current command facility state
     */
    public getState(hook: IDataHook): IUndoRedoFacilityState {
        return this.state.get(hook);
    }
}

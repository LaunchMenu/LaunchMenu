import {IUndoRedoFacility} from "./_types/IUndoRedoFacility";
import {ICommand} from "./_types/ICommand";
import {IDataHook, Field} from "model-react";
import {ICommandsList} from "./_types/ICommandsList";
import {CompoundCommand} from "./commands/CompoundCommand";

export class UndoRedoFacility implements IUndoRedoFacility {
    protected commands = new Field({past: [], future: []} as {
        past: ICommand[];
        future: ICommand[];
    });
    protected shouldSplitBatch = false;

    /**
     * Executes a given command
     * @param command The command to be executed
     * @param batchCommands Whether to batch this command with the previous command(s) if they also indicated to batch
     * @returns A promise that resolves when the command finishes executing or is canceled. true is returned if canceled
     */
    public async execute(
        command: ICommand,
        batchCommands?: boolean | ((previous?: ICommand) => boolean)
    ): Promise<void> {
        const {past, future} = this.getCommands();
        const prevCommand = past[past.length - 1] as ICommand | undefined;

        // Execute the command
        const finished = command.execute();

        // Add to the batch if requested
        if (batchCommands instanceof Function) batchCommands = batchCommands(prevCommand);
        if (batchCommands) {
            if (prevCommand instanceof CompoundCommand && !this.shouldSplitBatch) {
                command = prevCommand.augment(command);
                this.commands.set({
                    past: [...past.slice(0, past.length - 1), command],
                    future: [],
                });
            } else {
                command = new CompoundCommand([command]);
                this.commands.set({past: [...past, command], future: []});
            }
        }
        // Otherwise just add it to the commands directly
        else {
            this.commands.set({past: [...past, command], future: []});
        }

        // Reset split batch
        this.shouldSplitBatch = false;

        return finished;
    }

    /**
     * Makes sure the next executed command is not batched with the previous command,
     * even if the command specifies to be batched.
     */
    public splitBatch(): void {
        this.shouldSplitBatch = true;
    }

    /**
     * Steps 1 command back into the history
     * @returns A promise that resolves once the command is undone
     */
    public async undo(): Promise<void> {
        const {
            past: [...past],
            future,
        } = this.getCommands();
        const current = past.pop();
        if (current) {
            const promise = current.revert();
            this.commands.set({
                past,
                future: [current, ...future],
            });
            return promise;
        }
    }

    /**
     * Steps 1 command forward into the history
     * @returns A promise that resolves once the command is redone
     */
    public async redo(): Promise<void> {
        const {
            past,
            future: [current, ...future],
        } = this.getCommands();
        if (current) {
            const promise = current.execute();
            this.commands.set({
                past: [...past, current],
                future,
            });
            return promise;
        }
    }

    /**
     * Retrieves the state of the undo redo facility
     * @param hook The hook to subscribe to changes
     * @returns The current command facility state
     */
    public getState(hook: IDataHook = null): IUndoRedoFacilityState {
        const counts = {
            ready: 0,
            executing: 0,
            reverting: 0,
        } as {[P in IUndoRedoFacilityState]: number};

        const checkCmd = (cmd: ICommand) => {
            const cmdState = cmd.getState(hook);
            if (["preparingForExecution", "executing"].includes(cmdState))
                counts.executing++;
            else if (["preparingForRevert", "reverting"].includes(cmdState))
                counts.reverting++;
            else counts.ready++;
        };

        const {past, future} = this.getCommands(hook);
        past.forEach(checkCmd);
        future.forEach(checkCmd);

        if (counts.executing > 0 || counts.reverting > 0) {
            if (counts.executing > counts.reverting) return "executing";
            else return "reverting";
        }
        return "ready";
    }

    /**
     * Retrieves all commands currently stored in the facility
     * @param hook The hook to subscribe to changes
     * @returns The currently stored commands
     */
    public getCommands(hook: IDataHook = null): ICommandsList {
        return this.commands.get(hook);
    }
}

import {ICommand} from "../_types/ICommand";
import {ICommandMetadata} from "../_types/ICommandMetadata";
import {DataCacher, IDataHook} from "model-react";
import {ICommandState} from "../_types/ICommandState";

export class CompoundCommand implements ICommand {
    public readonly commands: ICommand[];
    public metadata: ICommandMetadata;

    /**
     * Creates a new compound command
     * @param metadata The meta data of the command
     * @param commands The commands to combine
     */
    public constructor(metadata: ICommandMetadata, commands: ICommand[]);
    /**
     * Creates a new compound command, inherits the metadata from the first provided command
     * @param commands The commands to combine
     */
    public constructor(commands: ICommand[]);
    public constructor(metadata: ICommandMetadata | ICommand[], commands?: ICommand[]) {
        if (!commands && metadata instanceof Array) {
            commands = metadata;
            metadata = commands[0]?.metadata || {name: "Compound Command"};
        }

        this.commands = commands as ICommand[];
        this.metadata = metadata as ICommandMetadata;
    }

    /**
     * Retrieves a new compound command that's equivalent to this command with the specified command added
     * @param command The command to add
     * @returns The new compound command
     */
    public augment(command: ICommand): CompoundCommand {
        return new CompoundCommand(this.metadata, [...this.commands, command]);
    }

    /**
     * Executes the compound command
     * @returns A promise that resolves once all subcommands finished executing
     */
    public async execute(): Promise<void> {
        await Promise.all(this.commands.map(command => command.execute()));
    }

    /**
     * Reverts the compound command
     * @returns A promise that resolves once all subcommands finished executing
     */
    public async revert(): Promise<void> {
        await Promise.all([...this.commands].reverse().map(command => command.revert()));
    }

    // Obtains the state data and caches it, only recalculating it if requested and any of the dependencies changed
    protected stateGetter = new DataCacher<{
        overall: ICommandState;
        commands: ICommandState[];
    }>(hook => {
        const states = this.commands.map(command => command.getState(hook));

        // Obtain the changed states compared to the previous iteration
        const sc = {
            executing: 0,
            preparingForExecution: 0,
            executed: 0,
            reverting: 0,
            ready: 0,
            preparingForRevert: 0,
        } as {[P in ICommandState]: number};
        states.forEach(state => (sc[state] += 1));

        // Decide what the overall state should be
        let newState: ICommandState;
        if (sc.executing > 0 || sc.reverting > 0) {
            if (sc.executing > sc.reverting) newState = "executing";
            else newState = "reverting";
        } else if (sc.preparingForExecution > 0 || sc.preparingForRevert > 0) {
            if (sc.preparingForExecution > sc.preparingForRevert)
                newState = "preparingForExecution";
            else newState = "preparingForRevert";
        } else {
            if (sc.ready > sc.executed) newState = "ready";
            else newState = "executed";
        }

        return {overall: newState, commands: states};
    });

    /**
     * Retrieves the state of the compound command. Combining the data of the child commands.
     * @param hook The hook to subscribe to changes
     * @returns The state of this command
     */
    public getState(hook: IDataHook = null): ICommandState {
        return this.stateGetter.get(hook).overall;
    }
}

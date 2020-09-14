import {ICommandMetadata} from "./ICommandMetadata";
import {IDataHook} from "model-react";
import {ICommandState} from "./ICommandState";

/**
 * A commando that can be executed and undone
 */
export type ICommand = {
    /**
     * The meta data to represent the command in some UI
     */
    metadata: ICommandMetadata;

    /**
     * Executes the command ||
     */
    execute(): Promise<void> | void;

    /**
     * Reverts the command if executed
     */
    revert(): Promise<void> | void;

    /**
     * Retrieves the state of the command
     * @param hook The hook to subscribe to changes
     * @returns The current state of the command
     */
    getState(hook: IDataHook): ICommandState;
};

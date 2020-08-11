import {Resource} from "../dependencies/Resource";
import {IDataHook} from "model-react";
import {ICommandState} from "./ICommandState";
import {ICommandMetadata} from "./ICommandMetadata";

/**
 * A command that can be executed and reverted
 */
export type IBaseCommand = {
    /**
     * The meta data to represent the command in some UI
     */
    metadata: ICommandMetadata;

    /**
     * The dependencies of the command.
     * Only one command per dependency can be executed at once
     */
    dependency: Resource[];

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

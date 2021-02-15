import {CompoundCommand} from "../commands/CompoundCommand";
import {ICommand} from "./ICommand";
/** A function to determine whether to batch a command with the previous command */
export type ICommandBatchFunction = {
    /**
     * Decides whether to batch with the previously dispatched command
     * @param previous The previously dispatched command
     * @returns Whether to batch with the previous command, or a command class to use for the compound command
     */
    <T extends CompoundCommand>(previous: ICommand):
        | boolean
        | {new (commands: ICommand[]): T};
};

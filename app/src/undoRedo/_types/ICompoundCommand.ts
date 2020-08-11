import {ICommandMetadata} from "./ICommandMetadata";
import {ICommand} from "./ICommand";

export type ICompoundCommand = {
    /**
     * The meta data of the command in order to visualize it in some UI
     */
    metadata: ICommandMetadata;

    /**
     * The commands that make up this compound command
     */
    commands: readonly ICommand[];
};

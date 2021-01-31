import {IExecuteArg} from "../../execute/_types/IExecuteArg";
import {ICommand} from "../../../../undoRedo/_types/ICommand";

/**
 * Data for a deletable items
 */
export type IDeletable = {
    /**
     * The function to execute the deletion, or returns a command to perform the deletion
     * @param data Context data that can be used
     * @returns A command if the deletion should be undoable
     */
    (data: IExecuteArg): Promise<ICommand | void> | ICommand | void;
};

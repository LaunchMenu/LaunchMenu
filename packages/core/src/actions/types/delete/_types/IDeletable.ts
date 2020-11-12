import {IContextExecuteData} from "../../../../context/_types/IContextExecuteData";
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
    (data: IContextExecuteData): Promise<ICommand | void> | ICommand | void;
};

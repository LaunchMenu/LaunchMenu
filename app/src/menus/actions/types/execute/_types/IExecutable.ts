import {ICommand} from "../../../../../undoRedo/_types/ICommand";

/**
 * An executable item
 */
export type IExecutable = {
    /**
     * Executes the item action, or retrieves the command to execute
     */
    execute: () => Promise<ICommand | void> | ICommand | void;
};

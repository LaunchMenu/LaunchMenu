import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IIOContext} from "../../../../../context/_types/IIOContext";

/**
 * An executable item
 */
export type IExecutable = {
    /**
     * Executes the item action, or retrieves the command to execute
     * @param data The data that can be used for execution
     * @returns Optionally a command to be executed
     */
    execute: (data: {
        /** oranges */
        context: IIOContext;
        /**
         * Prevents calling the 'onExecute' function, but allows for onExecute calling later using 'triggerLater'
         * @returns A function 'triggerLater' that can be used to allow invocation of the onExecute callback later
         */
        preventCallback?: () => () => void;
    }) => Promise<ICommand | void> | ICommand | void;
    /**
     * Whether this is a passive executor (I.E. shouldn't invoke the execute callback).
     * For instance used when the execution only changes UI (opens a menu, etc) without updating other state.
     */
    passive?: boolean;
};

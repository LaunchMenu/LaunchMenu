import {IIOContext} from "../../../../context/_types/IIOContext";
import {ICommand} from "../../../../undoRedo/_types/ICommand";

/**
 * An executable item
 */
export type IExecutable = {
    /**
     * Executes the item action, or retrieves the command to execute
     * @param data The data that can be used for execution
     * @returns Optionally a command to be executed
     */
    (data: {
        /** The context that can be used for execution */
        context: IIOContext;
        // Data is an object to more easily support future augmentation
    }): Promise<IExecutableResponse> | IExecutableResponse;
};

export type IExecutableResponse =
    | {
          /**
           * The resulting command to execute to perform this action
           */
          command?: ICommand;

          /**
           * Whether this is a passive executor (E.g. shouldn't close the context menu when executed).
           * For instance used when the execution only changes UI (opens a menu, etc) without updating other state.
           */
          passive?: boolean;
      }
    | ICommand
    | void;

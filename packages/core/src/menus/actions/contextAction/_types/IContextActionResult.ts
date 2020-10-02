import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {IContextExecuteData} from "../../../../context/_types/IContextExecuteData";

/**
 * The type of data that a context action should at least return from the getter
 */
export type IContextActionResult = {
    execute: (
        data?: Partial<IContextExecuteData>
    ) => Promise<ICommand | void> | ICommand | void;
};

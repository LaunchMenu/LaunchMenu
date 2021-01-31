import {IExecuteArg} from "../../execute/_types/IExecuteArg";
import {ICommand} from "../../../../undoRedo/_types/ICommand";

/**
 * Data for a resetable items
 */
export type IResetable = {
    (data: IExecuteArg): Promise<ICommand | void> | ICommand | void;
};

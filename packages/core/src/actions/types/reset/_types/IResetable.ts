import {IContextExecuteData} from "../../../../context/_types/IContextExecuteData";
import {ICommand} from "../../../../undoRedo/_types/ICommand";

/**
 * Data for a resetable items
 */
export type IResetable = {
    (data: IContextExecuteData): Promise<ICommand | void> | ICommand | void;
};

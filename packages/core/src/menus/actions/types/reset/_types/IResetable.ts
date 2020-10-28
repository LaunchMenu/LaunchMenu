import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IContextExecuteData} from "../../../../../context/_types/IContextExecuteData";

/**
 * Data for a resetable items
 */
export type IResetable = {
    reset: (data: IContextExecuteData) => Promise<ICommand | void> | ICommand | void;
};

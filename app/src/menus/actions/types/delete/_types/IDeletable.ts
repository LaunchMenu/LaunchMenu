import {IIOContext} from "../../../../../context/_types/IIOContext";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IContextExecuteData} from "../../../../../context/_types/IContextExecuteData";

/**
 * Data for a deletable items
 */
export type IDeletable = {
    delete: (data: IContextExecuteData) => Promise<ICommand | void> | ICommand | void;
};

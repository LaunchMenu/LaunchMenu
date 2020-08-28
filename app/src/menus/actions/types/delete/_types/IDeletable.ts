import {IIOContext} from "../../../../../context/_types/IIOContext";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";

/**
 * Data for a deletable items
 */
export type IDeletable = {
    delete: (data: {
        context: IIOContext;
        close: () => void;
    }) => Promise<ICommand | void> | ICommand | void;
};

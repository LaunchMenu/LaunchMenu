import {ICommand} from "./ICommand";

/**
 * The commands stored in a undo/redo facility
 */
export type ICommandsList = {
    /**
     * The commands that have been undone (but can still be redone)
     */
    future: ICommand[];

    /**
     * The commands that have been executed and can be undone
     */
    past: ICommand[];
};

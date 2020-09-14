import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IIOContext} from "../../../../../context/_types/IIOContext";

/**
 * An executable item
 */
export type IExecutable = {
    /**
     * Executes the item action, or retrieves the command to execute
     */
    execute: (data: {
        context: IIOContext;
        close?: () => void;
    }) => Promise<ICommand | void> | ICommand | void;
};

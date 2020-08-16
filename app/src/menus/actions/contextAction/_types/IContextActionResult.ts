import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * The type of data that a context action should at least return from the getter
 */
export type IContextActionResult = {
    execute: (
        context?: IIOContext,
        close?: () => void
    ) => Promise<ICommand | void> | ICommand | void;
};

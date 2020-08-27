import {IMenuItem} from "./_types/IMenuItem";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {IExecutable} from "../actions/types/execute/_types/IExecutable";
import {createStandardMenuItem} from "./createStandardMenuItem";

/**
 * A standard finish menu item creator, intended to commit a series of changes
 * @param config The data for the item
 * @returns The item
 */
export function createFinishMenuItem({
    onExecute,
    actionBindings,
}: {
    /** The callback to make when pressed */
    onExecute?: IExecutable["execute"];
    /** Any additional action bindings */
    actionBindings?: IActionBinding<any>[];
}): IMenuItem {
    return createStandardMenuItem({name: "Finish", onExecute, actionBindings});
}

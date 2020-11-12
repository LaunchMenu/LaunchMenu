import {IMenuItem} from "./_types/IMenuItem";
import {createStandardMenuItem} from "./createStandardMenuItem";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {IExecutableFunction} from "../../actions/types/execute/_types/IExecutable";

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
    onExecute?: IExecutableFunction;
    /** Any additional action bindings */
    actionBindings?: IActionBinding[];
}): IMenuItem {
    return createStandardMenuItem({name: "Finish", onExecute, actionBindings});
}

import {IDataHook} from "model-react";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * The core transformer of an action
 */
export type IActionCore<I, O> =
    /**
     * Transforms the input data to the output data
     * @param data The input data array
     * @param items The 2d array of items, indices correspond to data indices
     * @param hook The hook to subscribe to changes
     * @returns The output
     */
    (data: I[], items: IMenuItem[][], hook?: IDataHook) => O;

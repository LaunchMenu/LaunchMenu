import {IActionHandlerItems} from "./IActionHandlerItems";

export type IActionCore<I, O> =
    /**
     * Transforms the handlers and their items to the output action function
     * @param handlers The handlers and items to use
     * @returns The action execution function(s)
     */
    (handlers: IActionHandlerItems<any, I>) => O;

import {IAction} from "./IAction";
import {IActionBinding} from "./IActionBinding";

/**
 * The action binding together with the index of the binding in the input
 */
export type IIndexedActionBinding<A extends IAction = IAction> = {
    index: number;
} & IActionBinding<A>;

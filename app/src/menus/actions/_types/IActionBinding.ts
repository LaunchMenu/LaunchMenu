import { IAction } from "./IAction";

/**
 * A binding to an action action, specifying the data to execute the handler on an item
 */
export type IActionBinding<I> = {
    /**
     * The action to bind
     */
    readonly action: IAction<I, any>;
    /**
     * The binding data to be used by the action handler
     */
    readonly data: I;
    /**
     * The tags for this binding, can be used to add extra meta data
     */
    readonly tags: unknown[];
};

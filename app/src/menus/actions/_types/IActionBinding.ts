import {IAction} from "./IAction";
import {IActionHandler} from "./IActionHandler";
/**
 * A binding to an action handler (and thus action), specifying the data to execute the handler on an item
 */
export type IActionBinding<I> = {
    /**
     * The action handler to bind
     */
    readonly handler: IActionHandler<I, unknown, IAction<unknown, unknown>>;
    /**
     * The binding data to be used by the action handler
     */
    readonly data: I;
    /**
     * The tags for this binding, can be used to add extra meta data
     */
    readonly tags: unknown[];
};

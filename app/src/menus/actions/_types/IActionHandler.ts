import {IAction} from "./IAction";
import {IActionBinding} from "./IActionBinding";
import {ITagsOverride} from "./ITagsOverride";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * A handler for an action, specifying a certain implementation for the action
 */
export type IActionHandler<I, O, A extends IAction<any, any>> = {
    /**
     * A reference to the action this is a handler for
     */
    readonly action: A;

    /**
     * Creates a new binding for this handler, which this handler can execute
     * @param data The data to bind
     * @param tags The tags to add to the binding, this handler's default tags are inherited if left out
     * @returns The created binding
     */
    createBinding(data: I, tags?: ITagsOverride): IActionBinding<I>;

    /**
     * Retrieves the action handler data for a set of items, in order to be executed
     * @param items The items to get the data for, items without the correct bindings are ignored
     * @returns The handler execution functions that the action can use
     */
    get(items: IMenuItem[]): O;

    /**
     * Retrieves the action handler data for a set of bindings, in order to be executed
     * @param bindingData The binding data to get the execution data for
     * @returns The handler execution functions that the action can use
     */
    get(bindingData: I[]): O;
};

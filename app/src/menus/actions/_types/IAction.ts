import {ITagsOverride} from "./ITagsOverride";
import {IActionCore} from "./IActionCore";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionBinding} from "./IActionBinding";
import {IActionMultiResult} from "./IActionMultiResult";

export type IAction<I, O> = {
    /**
     * All ancestor actions
     */
    readonly ancestors: IAction<any, any>[];

    /**
     * Creates a new handler for this action, specifying how this action can be executed
     * @param handlerCore The function describing the execution process
     * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
     * @returns The created action handler
     */
    createHandler<T, O extends AI | IActionMultiResult<AI>, AI extends I>(
        handlerCore: IActionCore<T, O>,
        defaultTags?: ITagsOverride
    ): IAction<T, O>;

    /**
     * Creates a binding for this action
     * @param data The data to bind
     * @param tags The tags for the binding, inherited from the action if left out
     * @returns The binding
     */
    createBinding<P extends I>(data: P, tags?: ITagsOverride): IActionBinding<P>;

    /**
     * Checks whether the item contains a direct or indirect binding for this action
     * @param item The item to check
     * @returns Whether it contains a binding
     */
    canBeAppliedTo(item: IMenuItem): boolean;

    /**
     * Retrieves the action data for a set of items, in order to be executed
     * @param items The items to get the data for
     * @returns The action execution functions
     */
    get(items: IMenuItem[]): O;

    /**
     * Retrieves the action data for the given input data
     * @param data The data to run the core on
     * @param items The item array that the data was retrieved from, indices correspond to data indices
     * @returns The action execution functions or other data
     */
    get(data: I[], items: IMenuItem[][]): O;
};

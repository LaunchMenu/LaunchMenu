import {ITagsOverride} from "./ITagsOverride";
import {IActionCore} from "./IActionCore";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionBinding} from "./IActionBinding";
import {IActionMultiResult} from "./IActionMultiResult";
import {IMenuItemActionBindings} from "./IMenuItemActionBindings";
import {IDataHook} from "model-react";
import {INonFunction} from "../../../_types/INonFunction";

/**
 * An interface of an action that can be used on menu items.
 * Input data may not be a function, since we can't differentiate between those and subscribable data in bindings
 */
export type IAction<I extends INonFunction, O> = {
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
    createHandler<
        T extends INonFunction,
        O extends AI | IActionMultiResult<AI>,
        AI extends I
    >(
        handlerCore: IActionCore<T, O>,
        defaultTags?: ITagsOverride
    ): IAction<T, O>;

    /**
     * Creates a binding for this action
     * @param data The data to bind
     * @param tags The tags for the binding, inherited from the action if left out
     * @returns The binding
     */
    createBinding(
        data: I | ((hook: IDataHook) => I),
        tags?: ITagsOverride
    ): IActionBinding<I>;

    /**
     * Checks whether the item contains a direct or indirect binding for this action
     * @param item The item to check
     * @param hook The data hook to subscribe to changes
     * @returns Whether it contains a binding
     */
    canBeAppliedTo(item: IMenuItem | IActionBinding<any>[], hook?: IDataHook): boolean;

    /**
     * Retrieves the action data for a set of items, in order to be executed
     * @param items The items to get the data for
     * @param hook The data hook to subscribe to changes
     * @returns The action execution functions
     */
    get(items: (IMenuItem | IMenuItemActionBindings)[], hook?: IDataHook): O;

    /**
     * Retrieves the action data for the given input data
     * @param data The data to run the core on
     * @param items The item array that the data was retrieved from, indices correspond to data indices
     * @param hook The data hook to subscribe to changes
     * @returns The action execution functions or other data
     */
    get(data: I[], items: IMenuItem[][], hook?: IDataHook): O;
};

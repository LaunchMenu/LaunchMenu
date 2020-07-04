import {IActionHandlerCore} from "./IActionHandlerCore";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionHandler} from "./IActionHandler";
import {ITagsOverride} from "./ITagsOverride";

/**
 * An action that can be executed on menu items
 */
export type IAction<I, O> = {
    /**
     * Creates a new handler for this action, specifying how this action can be executed
     * @param handlerCore The function describing the execution process
     * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
     * @returns The created action handler
     */
    createHandler<T>(
        handlerCore: IActionHandlerCore<T, I>,
        defaultTags?: ITagsOverride
    ): IActionHandler<T, I, IAction<I, O>>;

    /**
     * Retrieves the action data for a set of items, in order to be executed
     * @param items The items to get the data for
     * @returns The action execution functions
     */
    get(items: IMenuItem[]): O;
};

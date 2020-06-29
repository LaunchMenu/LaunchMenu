import {IAction} from "./_types/IAction";
import {IActionHandlerCore} from "./_types/IActionHandlerCore";
import {ITagsOverride} from "./_types/ITagsOverride";
import {IActionBinding} from "./_types/IActionBinding";
import {IActionHandler} from "./_types/IActionHandler";
import {IMenuItem} from "../_types/IMenuItem";

/**
 * Checks whether the data is a menu item array
 * @param data The data to check
 * @returns Whether the data is a menu item array
 */
function isMenuItemArray<T>(data: T[] | IMenuItem[]): data is IMenuItem[] {
    return data.length > 0 && typeof data[0] == "object" && "actionBindings" in data[0];
}

/**
 * Creates a new action handler for the given action
 * @param action The action to create the handler for
 * @param handlerCore The core function of the handler
 * @param defaultTags The default tags to use for bindings
 * @returns The action handler
 */
export function createActionHandler<T, I, O>(
    action: IAction<I, O>,
    handlerCore: IActionHandlerCore<T, I>,
    defaultTags: any[]
): IActionHandler<T, I, IAction<I, O>> {
    return {
        action,
        createBinding(data: T, tags: ITagsOverride = tags => tags): IActionBinding<T> {
            return {
                handler: this,
                data: data,
                tags: tags instanceof Function ? tags(defaultTags) : tags,
            };
        },
        get(bindingData: T[] | IMenuItem[]): I {
            // Check if it's an item array, and if so extract the binding data
            if (isMenuItemArray(bindingData)) {
                const data = [] as T[];

                // Collect all bindings
                bindingData.forEach(item => {
                    item.actionBindings.forEach(({handler, data: itemData}) => {
                        // Make sure the binding is for this handler
                        if (handler != this) return;

                        // Add the data
                        data.push(itemData);
                    });
                });

                // Call handler core with the data
                return handlerCore(data);
            } else {
                return handlerCore(bindingData);
            }
        },
    };
}

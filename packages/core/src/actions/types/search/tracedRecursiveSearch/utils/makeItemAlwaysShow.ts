import {IDataHook} from "model-react";
import {adjustBindings} from "../../../../../menus/items/adjustBindings";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {IPriority} from "../../../../../menus/menu/priority/_types/IPriority";
import {IQuery} from "../../../../../menus/menu/_types/IQuery";
import {isActionBindingFor} from "../../../../utils/isActionBindingFor";
import {identityAction} from "../../../identity/identityAction";
import {searchAction} from "../../searchAction";
import {tracedRecursiveSearchHandler} from "../tracedRecursiveSearchHandler";
import {v4 as uuid} from "uuid";
import {SearchExecuter} from "../../../../../utils/searchExecuter/SearchExecuter";
import {IPrioritizedMenuItem} from "../../../../../menus/menu/_types/IPrioritizedMenuItem";

/**
 * Transforms an item such that it always shows up in a menu, even if it doesn't fit the search criteria
 * @param item The item to transform
 * @param priority The priority to give then item in searches
 * @returns The new item that always shows in searches
 */
export function makeItemAlwaysShow(
    item: IMenuItem,
    priority:
        | IPriority
        | ((
              query: IQuery,
              hook: IDataHook,
              executer?: SearchExecuter<IQuery, IPrioritizedMenuItem> | undefined
          ) => IPriority) = 0.3
): IMenuItem {
    const itemID = identityAction.get([item]).keys().next().value;

    // Create a search binding that returns this item no matter what the query
    const id = uuid();
    const searchBinding = tracedRecursiveSearchHandler.createBinding({
        itemID,
        ID: id,
        search: async (query, getItem, hook, executer) => {
            const item = getItem();
            return {
                item: item && {
                    ID: id,
                    item,
                    priority:
                        priority instanceof Function
                            ? priority(query, hook, executer)
                            : priority,
                },
            };
        },
    });

    // Return the item together with the new search action binding
    return {
        view: item.view,
        actionBindings: adjustBindings(item.actionBindings, bindings => [
            ...bindings.filter(binding => !isActionBindingFor(searchAction, binding)),
            searchBinding,
        ]),
    };
}

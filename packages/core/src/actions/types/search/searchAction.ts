import {IDataHook} from "model-react";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {IUUID} from "../../../_types/IUUID";
import {createAction} from "../../createAction";
import {IActionTarget} from "../../_types/IActionTarget";
import {menuItemIdentityAction} from "../identity/menuItemIdentityAction";
import {IMenuSearchable} from "./_types/IMenuSearchable";

/**
 * An action to search within a menu
 */
export const searchAction = createAction({
    name: "search",
    core: (searchers: IMenuSearchable[]) => ({
        result: searchers,
    }),
});

export const queryIdentitiesSymbol = Symbol("identities");

/**
 * Retrieves the identity associated with a certain ID of
 * @param ID The ID of the identity to retrieve
 * @param query The query to cache the data in
 * @param items The items to retrieve the identity from
 * @param hook The data hook to subscribe to changes
 * @returns The menu item to retrieve
 */
export function getSearchIdentity(
    ID: IUUID,
    query: IQuery & {[queryIdentitiesSymbol]?: Map<IUUID, () => IMenuItem>},
    items: IActionTarget[],
    hook?: IDataHook
): IMenuItem | undefined {
    // If the ID is in the map, return the associated item
    if (query[queryIdentitiesSymbol]?.has(ID))
        return query[queryIdentitiesSymbol]?.get(ID)?.();

    // Initialize the item map in the query, to cache the data in
    if (!query[queryIdentitiesSymbol]) query[queryIdentitiesSymbol] = new Map();
    const cache = query[queryIdentitiesSymbol];

    // Add the new identities
    const newIdentities = menuItemIdentityAction.get(items, hook);
    for (let [key, value] of newIdentities) cache?.set(key, value);

    // Retrieve the menu item from the cache
    return cache?.get(ID)?.();
}

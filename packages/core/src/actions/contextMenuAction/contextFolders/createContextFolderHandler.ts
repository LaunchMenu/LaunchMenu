import {DataCacher, IDataHook} from "model-react";
import {IContextMenuItemData} from "../_types/IContextMenuItemData";
import {IContextFolderAction} from "./_types/IContextFolderAction";
import {IContextFolderHandlerConfig} from "./_types/IContextFolderHandlerConfig";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {Priority} from "../../../menus/menu/priority/Priority";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {hasHigherOrEqualPriority} from "../../../menus/menu/priority/hasHigherOrEqualPriority";
import {createAction} from "../../createAction";
import {collectContextMenuItems} from "../collectContextMenuItems";
import {contextMenuAction} from "../contextMenuAction";
import {createContextFolderMenuItem} from "../../../menus/items/types/createContextFolderMenuItem";

/**
 * Creates a context menu handler that adds an folder to the (context) menu
 * @param config The configuration for the context folder
 */
export function createContextFolderHandler(
    config: IContextFolderHandlerConfig
): IContextFolderAction {
    const parent = config.parent ? config.parent : contextMenuAction;

    const {
        name,
        itemData: contextItemData,
        override,
        preventCountCategory,
        priority,
    } = config;

    // Create the action itself
    return createAction({
        name,
        parents: [parent, ...(override ? [override] : [])],
        core: function (itemData: IContextMenuItemData[], _1, _2, targets) {
            // Create a retriever for the menu items (Cache is important, since createFolderMenuItem expects multiple calls to return the same items, unless a hook specified data updated)
            const itemsSource = new DataCacher(h => {
                const sources = targets.filter(target => "view" in target);
                const extra = targets
                    .filter(target => !("view" in target))
                    .flatMap(({actionBindings}) => getHooked(actionBindings, h));
                const items = collectContextMenuItems(itemData, sources, extra, h);
                const positiveItems = items.filter(({priority}) =>
                    Priority.isPositive(priority)
                );
                positiveItems.sort((a, b) =>
                    hasHigherOrEqualPriority(a.priority, b.priority) ? -1 : 1
                );
                return positiveItems.map(({item}) => item);
            });
            const itemsGetter = (h: IDataHook) => itemsSource.get(h);
            const searchItems = contextItemData?.preventSearch
                ? []
                : (query: IQuery, hook: IDataHook) => itemsGetter(hook);

            // Create the item
            const item = createContextFolderMenuItem({
                name,
                pathName: name,
                children: itemsGetter,
                searchChildren: searchItems,
                ...contextItemData,
            });

            // Retrieve the result with bindings for the parent menu
            const parentBinding = parent.createBinding({
                action: this,
                item: {
                    priority,
                    item,
                },
                override,
                preventCountCategory,
            });

            // Override binding, forward items to folder being overridden
            const overrideBindings = override
                ? itemData.map(item => override.createBinding(item))
                : [];

            return {
                result: itemData,
                children: [parentBinding, ...overrideBindings],
            };
        },
    });
}

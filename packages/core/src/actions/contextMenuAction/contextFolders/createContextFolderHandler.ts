import {IDataHook} from "model-react";
import {createFolderMenuItem} from "../../../menus/items/createFolderMenuItem";
import {IStandardMenuItemData} from "../../../menus/items/_types/IStandardMenuItemData";
import {hasHigherOrEqualPriority} from "../../../menus/menu/priority/hasHigherOrEqualPriority";
import {IPriority} from "../../../menus/menu/priority/_types/IPriority";
import {DataCacher} from "../../../utils/modelReact/DataCacher";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {createAction} from "../../createAction";
import {collectContextMenuItems} from "../collectContextMenuItems";
import {contextMenuAction} from "../contextMenuAction";
import {IContextMenuItemData} from "../_types/IContextMenuItemData";
import {IContextFolderAction} from "./_types/IContextFolderAction";

/**
 * Creates a context menu handler that adds an folder to the menu
 * @param config The configuration for the context folder
 */
export function createContextFolderHandler(config: {
    /** The name of the folder, used for debugging */
    name: string;
    /** The priority the item has in the context menu */
    priority: IPriority;
    /** The item to be shown, or data to create the item. Debug name will be used if name is left out */
    itemData?: IStandardMenuItemData & {
        /** A name for the path (defaults to the item name)*/
        pathName?: string;
        /** Whether to prevent recursive search into this directory (defaults to false) */
        preventSearch?: boolean;
        /** Whether to close the menu when an active item is executed (defaults to true) */
        closeOnExecute?: boolean;
        /** Whether to forward the key events passed to this item to the item's children (defaults to true) */
        forwardKeyEvents?: boolean;
    };
    /**
     * The root folder action for which to override the context item, if all its bindings (children) originate from this action.
     * Bindings to this folder will automatically be treated as bindings to the override folder too.
     * This will automatically override any ancestor overrides too (overrides specified by our ancestors).
     */
    override?: IContextFolderAction;
    /** Whether to prevent adding the count category to the item, defaults to false */
    preventCountCategory?: boolean;
    /** The folder that this folder should appear in */
    parent?: IContextFolderAction;
}): IContextFolderAction {
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
                const positiveItems = items.filter(({priority}) => priority > 0);
                positiveItems.sort((a, b) =>
                    hasHigherOrEqualPriority(a.priority, b.priority) ? -1 : 1
                );
                return positiveItems.map(({item}) => item);
            });
            const itemsGetter = (h: IDataHook) => itemsSource.get(h);
            const searchItems = contextItemData?.preventSearch ? [] : itemsGetter;

            // Create the item
            const item = createFolderMenuItem({
                name,
                pathName: name,
                closeOnExecute: true,
                forwardKeyEvents: true,
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

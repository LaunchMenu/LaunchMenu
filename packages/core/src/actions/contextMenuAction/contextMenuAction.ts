import {IDataHook} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import type {ProxiedPrioritizedMenu} from "../../menus/menu/ProxiedPrioritizedMenu";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createAction} from "../createAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IActionTarget} from "../_types/IActionTarget";
import {IContextMenuItemData} from "./_types/IContextMenuItemData";
import {collectContextMenuItems} from "./collectContextMenuItems";
import {getHooked} from "../../utils/subscribables/getHooked";

export const contextMenuAction = createAction({
    name: "contextMenuAction",
    core: (items: IContextMenuItemData[]) => ({result: items}),

    extras: {
        /**
         * Retrieves all the context items for the given targets
         * @param items The items to retrieve the context items from
         * @param extraBindings Extra bindings that shouldn't contribute to the itemCount, but should be used to show items in the menu
         * @param hook A hook to subscribe to changes
         * @returns The context items
         */
        getItems(
            items: IActionTarget[],
            extraBindings: ISubscribable<IActionBinding<IAction>[]> = [],
            hook?: IDataHook
        ): IPrioritizedMenuItem[] {
            const allTargets = [...items, {actionBindings: extraBindings}];
            const contextItemData = contextMenuAction.get(allTargets, hook);

            return collectContextMenuItems(contextItemData, items, extraBindings, hook);
        },

        /**
         * Retrieves the context menu for the given selection of items, which automatically updates on changes
         * @param items The items to get the context menu for
         * @param context The IOContext that the context menu can use
         * @returns The menu
         */
        getMenu(items: IActionTarget[], context: IIOContext): ProxiedPrioritizedMenu {
            // Create the source for the context items
            const contextItems = (h: IDataHook) => {
                const extraBindings: IActionBinding[] = getHooked(
                    context.contextMenuBindings,
                    h
                );
                return contextMenuAction.getItems(items, extraBindings, h);
            };

            // Dynamically import the proxied prioritized menu class in order to deal with circular dependencies
            const ProxiedPrioritizedMenuClass: typeof ProxiedPrioritizedMenu = require("../../menus/menu/ProxiedPrioritizedMenu")
                .ProxiedPrioritizedMenu;
            return new ProxiedPrioritizedMenuClass(context, contextItems);
        },
    },
});

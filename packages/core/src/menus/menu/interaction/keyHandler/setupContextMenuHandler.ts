import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {createContextCategoriesSorter} from "../../../../actions/contextMenuAction/createContextCategoriesSorter";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {IMenuItemExecuteCallback} from "../../_types/IMenuItemExecuteCallback";
import {contextMenuAction} from "../../../../actions/contextMenuAction/contextMenuAction";
import {keyHandlerAction} from "../../../../actions/types/keyHandler/keyHandlerAction";
import {PrioritizedMenu} from "../../PrioritizedMenu";
import {Observer} from "model-react";
import {IDisposableKeyEventListener} from "../../../../textFields/interaction/_types/IDisposableKeyEventListener";

/**
 * Sets up a key listener to open the context menu, and forward key events to context menu items
 * @param menu The menu to create the context menu handler for
 * @param config The configuration to customize the handler
 * @returns An object with an event emit function and destroy function
 */
export function setupContextMenuHandler(
    menu: IMenu,
    {
        onExecute,
        useContextItemKeyHandlers = true,
        pattern = menu
            .getContext()
            .settings.get(baseSettings)
            .controls.menu.openContextMenu.get(),
    }: {
        /* A callback for when an item gets executed (may be suppressed/delayed by an executable) */
        onExecute?: IMenuItemExecuteCallback;
        /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
        useContextItemKeyHandlers?: boolean;
        /** A pattern to detect whether to handle the keyboard opening */
        pattern?: KeyPattern | (() => KeyPattern);
    } = {}
): IDisposableKeyEventListener {
    const ioContext = menu.getContext();
    let contextData: {
        emitter?: {
            emit(
                event: KeyEvent,
                menu: IMenu,
                onExecute?: IMenuItemExecuteCallback
            ): Promise<boolean>;
        };
        items?: IPrioritizedMenuItem[];
        menu?: PrioritizedMenu;
        close?: () => void;
    } = {};
    let contextItemsObserver: Observer<void> | undefined;

    return {
        handler: async (e: KeyEvent) => {
            // Bail out if there is no reason to compute the context data
            const isMenuOpenEvent = getHooked(pattern).matches(e);
            if (!isMenuOpenEvent && !useContextItemKeyHandlers) return;

            // Cache the context data for subsequent key presses
            if (!contextItemsObserver)
                contextItemsObserver = new Observer(
                    hook => {
                        // Remove old items if relevant
                        if (contextData.menu && contextData.items)
                            contextData.menu.removeItems(contextData.items);

                        // Retrieve the new context items, and subscribe to item changes
                        contextData.items = contextMenuAction.getItems(
                            menu.getAllSelected(hook),
                            getHooked(ioContext.contextMenuBindings, hook),
                            hook
                        );

                        // Add the new items to the context menu if relevant
                        if (contextData.menu)
                            contextData.menu.addItems(contextData.items);

                        // Obtain a new emitter and subscribe to possible changes
                        contextData.emitter = keyHandlerAction.get(
                            contextData.items.map(({item}) => item),
                            hook
                        );
                    },
                    {init: true}
                );

            // Forward events to context items
            if (
                useContextItemKeyHandlers &&
                (await contextData.emitter?.emit(e, menu, onExecute))
            )
                return true;

            // Open the menu if requested
            if (isMenuOpenEvent) {
                const items = contextData.items;

                if (items && items.length > 0 && !contextData.menu) {
                    const menu = (contextData.menu = new PrioritizedMenu(ioContext, {
                        sortCategories: createContextCategoriesSorter(ioContext),
                    }));
                    menu.addItems(items);

                    // Dynamically load the contextMenuLayer to deal with a dependency cycle (contextMenuLayer -> UILayer -> createMenuKeyHandler -> setupContextMenuHandler)
                    const ContextMenuLayer: typeof import("../../../../uiLayers/types/context/ContextMenuLayer").ContextMenuLayer = require("../../../../uiLayers/types/context/ContextMenuLayer")
                        .ContextMenuLayer;
                    contextData.close = await ioContext.open(
                        new ContextMenuLayer({
                            menu,
                            onExecute: () => contextData?.close?.(),
                            onClose: () => {
                                contextData.close = undefined;
                                contextData.menu = undefined;
                            },
                        })
                    );
                }
                return true;
            }
        },
        destroy: () => contextItemsObserver?.destroy(),
    };
}

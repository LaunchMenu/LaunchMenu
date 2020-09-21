import {IMenu} from "../../_types/IMenu";
import {Observer} from "../../../../utils/modelReact/Observer";
import {IKeyEventListenerObject} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {keyHandlerAction} from "../../../actions/types/keyHandler/keyHandlerAction";
import {getContextMenuItems} from "../../../contextMenu/getContextMenuItems";
import {openUI} from "../../../../context/openUI/openUI";
import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {PrioritizedMenu} from "../../PrioritizedMenu";
import {sortContextCategories} from "../../../contextMenu/sortContextCategories";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../items/inputs/handlers/keyPattern/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {getHooked} from "../../../../utils/subscribables/getHooked";

/**
 * Sets up a key listener to open the context menu, and forward key events to context menu items
 * @param menu The menu to create the context menu handler for
 * @param config The configuration to customize the handler
 * @returns An object with an event emit function and destroy function
 */
export function setupContextMenuHandler(
    menu: IMenu,
    {
        useContextItemKeyHandlers = true,
        pattern = menu
            .getContext()
            .settings.get(baseSettings)
            .controls.menu.openContextMenu.get(),
    }: {
        /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
        useContextItemKeyHandlers?: boolean;
        /** A pattern to detect whether to handle the keyboard opening */
        pattern?: KeyPattern | (() => KeyPattern);
    } = {}
): IKeyEventListenerObject {
    const ioContext = menu.getContext();
    let contextData: {
        emitter?: {emit(event: KeyEvent, context: IIOContext): Promise<boolean>};
        items?: IPrioritizedMenuItem[];
        menu?: PrioritizedMenu;
        close?: () => void;
    } = {};
    let contextItemsObserver: Observer<void> | undefined;

    return {
        /**
         * Emits an event to all item listeners in the menu
         * @param e The event to emit
         * @returns Whether the event was caught
         */
        async emit(e: KeyEvent): Promise<boolean | void> {
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
                        contextData.items = getContextMenuItems(
                            menu.getAllSelected(hook),
                            ioContext,
                            () => contextData?.close?.(),
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
                (await contextData.emitter?.emit(e, ioContext))
            )
                return true;

            // Open the menu if requested
            if (isMenuOpenEvent) {
                const items = contextData.items;
                if (items && items.length > 0 && !contextData.menu) {
                    const menu = (contextData.menu = new PrioritizedMenu(ioContext, {
                        sortCategories: sortContextCategories,
                    }));
                    menu.addItems(items);
                    contextData.close = openUI(ioContext, {menu}, () => {
                        contextData.close = undefined;
                        contextData.menu = undefined;
                    });
                }
                return true;
            }
        },

        /**
         * Destroys the hook that was added to the menu
         */
        destroy() {
            contextItemsObserver?.destroy();
        },
    };
}

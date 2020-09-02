import {IMenu} from "../../_types/IMenu";
import {Observer} from "../../../../utils/modelReact/Observer";
import {IKeyEventListenerFunction} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {keyHandlerAction} from "../../../actions/types/keyHandler/keyHandlerAction";
import {getContextMenuItems} from "../../../utils/getContextMenu";
import {openUI} from "../../../../context/openUI/openUI";
import {Menu} from "../../Menu";

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
        isOpenMenuButton = e => e.is("tab"),
    }: {
        /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
        useContextItemKeyHandlers?: boolean;
        /** A function returning whether the given event is a menu open event */
        isOpenMenuButton?: IKeyEventListenerFunction;
    } = {}
) {
    const ioContext = menu.getContext();
    let contextData: {
        emitter: {emit: IKeyEventListenerFunction};
        items: IMenuItem[];
        close?: () => void;
    } | null = null;

    // Remove the emitter if the list of items changes, since it's no longer valid
    const selectionObserver = new Observer(h => menu.getAllSelected(h)).listen(() => {
        contextData = null;
    });

    return {
        /**
         * Emits an event to all item listeners in the menu
         * @param e The event to emit
         * @returns Whether the event was caught
         */
        async emit(e: KeyEvent): Promise<boolean | void> {
            // Bail out if there is no reason to compute the context data
            const isMenuOpenEvent = isOpenMenuButton(e);
            if (!isMenuOpenEvent && !useContextItemKeyHandlers) return;

            // Cache the context data for subsequent key presses
            if (!contextData) {
                const items = getContextMenuItems(menu.getAllSelected(), ioContext, () =>
                    contextData?.close?.()
                );
                const emitter = keyHandlerAction.get(items);
                contextData = {items, emitter};
            }

            // Forward events to context items
            if (useContextItemKeyHandlers && (await contextData.emitter.emit(e)))
                return true;

            // Open the menu if requested
            if (isMenuOpenEvent) {
                if (contextData.items.length > 0)
                    contextData.close = openUI(ioContext, {
                        menu: new Menu(ioContext, contextData.items),
                    });
                return true;
            }
        },
        /**
         * Destroys the hook that was added to the menu
         */
        destroy() {
            selectionObserver.destroy();
        },
    };
}

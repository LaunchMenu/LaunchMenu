import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {setupMoveInputHandler} from "./setupMoveInputHandler";
import {handleDeselectInput} from "./handleDeselectInput";
import {setupItemKeyListenerHandler} from "./setupItemKeyListenerHandler";
import {setupContextMenuHandler} from "./setupContextMenuHandler";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IMenuItemExecuteCallback} from "../../_types/IMenuItemExecuteCallback";
import {IDisposableKeyEventListener} from "../../../../textFields/interaction/_types/IDisposableKeyEventListener";

/**
 * Creates a standard menu key handler
 * @param menu The menu to create the handler for
 * @param config Any additional optional data for the key handler configuration
 * @returns The key handler that can be added to the UILayer
 */
export function createStandardMenuKeyHandler(
    menu: IMenu,
    {
        onExit,
        onExecute,
        useItemKeyHandlers = true,
        useContextItemKeyHandlers = true,
    }: {
        /** The code to execute when trying to exit the menu */
        onExit?: () => void;
        /* A callback for when an item gets executed (may be suppressed/delayed by an executable) */
        onExecute?: IMenuItemExecuteCallback;
        /** Whether to forward events to item key handlers (can be slow for menus with many items), defaults to true*/
        useItemKeyHandlers?: boolean;
        /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
        useContextItemKeyHandlers?: boolean;
    } = {}
): IDisposableKeyEventListener {
    const context = menu.getContext();
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.menu;

    // Setup handlers
    let {
        handler: handleItemKeyListeners,
        destroy: destroyItemListenersHandler,
    } = useItemKeyHandlers
        ? setupItemKeyListenerHandler(menu, onExecute)
        : {handler: undefined, destroy: undefined};
    const {
        handler: handleContextMenu,
        destroy: destroyContextMenuHandler,
    } = setupContextMenuHandler(menu, {
        useContextItemKeyHandlers,
        pattern: () => fieldSettings.openContextMenu.get(),
    });
    const handleCursorMovement = setupMoveInputHandler(menu, fieldSettings);

    // Return the listener
    return {
        handler: async (e: KeyEvent) => {
            if (await handleItemKeyListeners?.(e)) return true;
            if (await handleContextMenu(e)) return true;
            if (handleExecuteInput(e, menu, onExecute, fieldSettings.execute.get()))
                return true;
            if (await handleCursorMovement?.(e)) return true;
            if (handleDeselectInput(e, menu, settings.common.back.get())) return true;
            if (onExit && settings.common.back.get().matches(e)) {
                onExit();
                return true;
            }
        },
        destroy: () => {
            destroyItemListenersHandler?.();
            destroyContextMenuHandler();
        },
    };
}

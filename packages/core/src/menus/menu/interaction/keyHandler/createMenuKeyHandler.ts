import {
    IKeyEventListener,
    IKeyEventListenerObject,
} from "../../../../keyHandler/_types/IKeyEventListener";
import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {setupMoveInputHandler} from "./setupMoveInputHandler";
import {handleDeselectInput} from "./handleDeselectInput";
import {setupItemKeyListenerHandler} from "./setupItemKeyListenerHandler";
import {setupContextMenuHandler} from "./setupContextMenuHandler";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IMenuItemExecuteCallback} from "../../_types/IMenuItemExecuteCallback";

/**
 * Creates a standard menu key handler
 * @param menu The menu to create the handler for
 * @param config Any additional optional data for the key handler configuration
 * @returns The key handler that can be added to the input handler stack
 */
export function createMenuKeyHandler(
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
): IKeyEventListener {
    const context = menu.getContext();
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.menu;

    // Setup handlers
    let handleItemKeyListeners = useItemKeyHandlers
        ? setupItemKeyListenerHandler(menu, onExecute)
        : undefined;
    const contextHandler = setupContextMenuHandler(menu, {
        useContextItemKeyHandlers,
        pattern: () => fieldSettings.openContextMenu.get(),
    });
    const cursorMovementHandler = setupMoveInputHandler(menu, fieldSettings);

    // Return the listener
    return {
        async emit(e: KeyEvent): Promise<boolean | void> {
            if (await handleItemKeyListeners?.emit(e)) return true;
            if (await contextHandler.emit(e)) return true;
            if (handleExecuteInput(e, menu, onExecute, fieldSettings.execute.get()))
                return true;
            if (await cursorMovementHandler.emit(e)) return true;
            if (handleDeselectInput(e, menu, settings.back.get())) return true;
            if (onExit && settings.back.get().matches(e)) {
                onExit();
                return true;
            }
        },
        destroy() {
            handleItemKeyListeners?.destroy?.();
            contextHandler.destroy?.();
            cursorMovementHandler.destroy?.();
        },
    } as IKeyEventListenerObject;
}

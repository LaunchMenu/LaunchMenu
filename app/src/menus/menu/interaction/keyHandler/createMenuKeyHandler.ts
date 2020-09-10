import {
    IKeyEventListener,
    IKeyEventListenerObject,
} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {setupMoveInputHandler} from "./setupMoveInputHandler";
import {handleDeselectInput} from "./handleDeselectInput";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {setupItemKeyListenerHandler} from "./setupItemKeyListenerHandler";
import {setupContextMenuHandler} from "./setupContextMenuHandler";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

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
        useItemKeyHandlers = true,
        useContextItemKeyHandlers = true,
    }: {
        /** The code to execute when trying to exit the menu */
        onExit?: () => void;
        /** Whether to forward events to item key handlers (can be slow for menus with many items), defaults to true*/
        useItemKeyHandlers?: boolean;
        /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
        useContextItemKeyHandlers?: boolean;
    } = {}
): IKeyEventListener {
    // Setup handlers
    let handleItemKeyListeners = useItemKeyHandlers
        ? setupItemKeyListenerHandler(menu)
        : undefined;
    const contextHandler = setupContextMenuHandler(menu, {
        useContextItemKeyHandlers,
    });
    const cursorMovementHandler = setupMoveInputHandler(menu);

    // Return the listener
    return {
        async emit(e: KeyEvent): Promise<boolean | void> {
            if (await handleItemKeyListeners?.emit(e)) return true;
            if (await contextHandler.emit(e)) return true;
            if (handleExecuteInput(e, menu)) return true;
            if (await cursorMovementHandler.emit(e)) return true;
            if (handleDeselectInput(e, menu)) return true;
            if (onExit && e.is("esc")) {
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

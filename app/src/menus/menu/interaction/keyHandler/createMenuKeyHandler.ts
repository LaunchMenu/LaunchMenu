import {
    IKeyEventListener,
    IKeyEventListenerObject,
} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {handleMoveInput} from "./handleMoveInput";
import {handleDeselectInput} from "./handleDeselectInput";
import {handleContextInput} from "./handleContextInput";
import {IKeyHandlerStack} from "../../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IViewStack} from "../../../../stacks/_types/IViewStack";
import {IPartialIOContext} from "../../../../context/_types/IIOContext";
import {setupItemKeyListenerHandler} from "./setupItemKeyListenerHandler";
import {setupContextMenuHandler} from "./setupContextMenuHandler";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Creates a standard menu key handler
 * @param menu The menu to create the handler for
 * @param ioContext The IO context to use to open the context menu
 * @param config Any additional optional data for the key handler configuration
 * @returns The key handler that can be added to the input handler stack
 */
export function createMenuKeyHandler(
    menu: IMenu,
    ioContext: {
        panes: {menu: IViewStack};
        keyHandler: IKeyHandlerStack;
    } & IPartialIOContext,
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
    // Setup the item key handler
    let handleItemKeyListeners = useItemKeyHandlers
        ? setupItemKeyListenerHandler(menu)
        : undefined;

    // Setup the context key handler
    const contextHandler = setupContextMenuHandler(menu, ioContext, {
        useContextItemKeyHandlers,
    });

    // Return the listener
    return {
        async emit(e: KeyEvent): Promise<boolean | void> {
            if (await handleItemKeyListeners?.emit(e)) return true;
            if (await contextHandler.emit(e)) return true;
            if (handleExecuteInput(e, menu)) return true;
            if (handleMoveInput(e, menu)) return true;
            if (handleDeselectInput(e, menu)) return true;
            if (handleDeselectInput(e, menu)) return true;
            if (onExit && e.is("esc")) {
                onExit();
                return true;
            }
        },
        destroy() {
            handleItemKeyListeners?.destroy();
            contextHandler.destroy();
        },
    } as IKeyEventListenerObject;
}

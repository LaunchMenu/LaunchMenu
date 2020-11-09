import {IMenu} from "../../_types/IMenu";
import {Observer} from "../../../../utils/modelReact/Observer";
import {IKeyEventListenerObject} from "../../../../keyHandler/_types/IKeyEventListener";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {IMenuItemExecuteCallback} from "../../_types/IMenuItemExecuteCallback";
import {keyHandlerAction} from "../../../../actions/types/keyHandler/keyHandlerAction";

/**
 * Sets up a key event handler that emits events to the items in a menu
 * @param menu The menu for which to add item key event handlers
 * @param onExecute The callback function for when an item is actively executed
 * @returns An object with an event emit function and a destroy function
 */
export function setupItemKeyListenerHandler(
    menu: IMenu,
    onExecute?: IMenuItemExecuteCallback
): IKeyEventListenerObject {
    let emitter: {
        emit(
            event: KeyEvent,
            menu: IMenu,
            onExecute?: IMenuItemExecuteCallback
        ): Promise<boolean>;
    } | null = null;
    let itemObserver: Observer<void> | undefined;

    return {
        /**
         * Emits an event to all item listeners in the menu
         * @param e The event to emit
         * @returns Whether the event was caught
         */
        async emit(e: KeyEvent): Promise<boolean | void> {
            // Cache the emitter for subsequent key presses
            if (!itemObserver) {
                itemObserver = new Observer(
                    hook => {
                        emitter = keyHandlerAction.get(menu.getItems(hook), hook);
                    },
                    {init: true}
                );
            }

            if (emitter) return await emitter.emit(e, menu, onExecute);
        },

        /**
         * Destroys the hook that was added to the menu
         */
        destroy() {
            itemObserver?.destroy();
        },
    };
}

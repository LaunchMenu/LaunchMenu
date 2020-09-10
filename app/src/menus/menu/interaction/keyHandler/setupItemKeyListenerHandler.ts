import {IMenu} from "../../_types/IMenu";
import {Observer} from "../../../../utils/modelReact/Observer";
import {IKeyEventListenerObject} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {keyHandlerAction} from "../../../actions/types/keyHandler/keyHandlerAction";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * Sets up a key event handler that emits events to the items in a menu
 * @param menu The menu for which to add item key event handlers
 * @returns An object with an event emit function and a destroy function
 */
export function setupItemKeyListenerHandler(menu: IMenu): IKeyEventListenerObject {
    const ioContext = menu.getContext();
    let emitter: {
        emit(event: KeyEvent, context: IIOContext): Promise<boolean>;
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

            if (emitter) return await emitter.emit(e, ioContext);
        },

        /**
         * Destroys the hook that was added to the menu
         */
        destroy() {
            itemObserver?.destroy();
        },
    };
}

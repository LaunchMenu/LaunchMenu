import {IMenu} from "../../_types/IMenu";
import {Observer} from "../../../../utils/modelReact/Observer";
import {IKeyEventListenerFunction} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {keyHandlerAction} from "../../../actions/types/keyHandler/keyHandlerAction";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Sets up a key event handler that emits events to the items in a menu
 * @param menu The menu for which to add item key event handlers
 * @returns An object with an event emit function and a destroy function
 */
export function setupItemKeyListenerHandler(menu: IMenu) {
    let emitter: {emit: IKeyEventListenerFunction} | null = null;

    // Remove the emitter if the list of items changes, since it's no longer valid
    const itemObserver = new Observer(h => menu.getItems(h)).listen(() => {
        emitter = null;
    });

    return {
        /**
         * Emits an event to all item listeners in the menu
         * @param e The event to emit
         * @returns Whether the event was caught
         */
        async emit(e: KeyEvent): Promise<boolean | void> {
            // Cache the emitter for subsequent key presses
            if (!emitter) emitter = keyHandlerAction.get(menu.getItems());
            return await emitter.emit(e);
        },
        /**
         * Destroys the hook that was added to the menu
         */
        destroy() {
            itemObserver.destroy();
        },
    };
}

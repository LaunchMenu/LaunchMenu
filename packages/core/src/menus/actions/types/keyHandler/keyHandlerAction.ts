import {Action} from "../../Action";
import {IItemKeyHandler} from "./_types/IItemKeyHandler";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IMenu} from "../../../menu/_types/IMenu";

/**
 * An action to invoke key events on actions
 */
export const keyHandlerAction = new Action((listeners: IItemKeyHandler[]) => {
    return {
        /**
         * Emits a key event to all listeners
         * @param event The event to emit
         * @param menu The menu that the item is in that forwarded this event
         * @param onExecute The item execution listener for the menu
         * @returns Whether the event was caught
         */
        async emit(
            event: KeyEvent,
            menu: IMenu,
            onExecute?: () => void
        ): Promise<boolean> {
            let caught = false;
            for (let {onKey} of listeners) {
                // Forward the event
                const res = await onKey(event, menu, onExecute);

                // Handle catch data
                if (res instanceof Object) {
                    if (res.stopPropagation) caught = true;
                    if (res.stopImmediatePropagation) {
                        caught = true;
                        break;
                    }
                } else if (res) {
                    caught = true;
                }
            }

            return caught;
        },
    };
}, []);

import {Action} from "../../Action";
import {IItemKeyHandler} from "./_types/IItemKeyHandler";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * An action to invoke key events on actions
 */
export const keyHandlerAction = new Action((listeners: IItemKeyHandler[]) => {
    return {
        /**
         * Emits a key event to all listeners
         * @param event The event to emit
         * @param context The context to use
         * @returns Whether the event was caught
         */
        async emit(event: KeyEvent, context: IIOContext): Promise<boolean> {
            let caught = false;
            for (let {onKey} of listeners) {
                // Forward the event
                const res = await onKey(event, context);

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

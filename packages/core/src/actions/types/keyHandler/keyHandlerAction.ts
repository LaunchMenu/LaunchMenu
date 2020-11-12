import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {IMenuItemExecuteCallback} from "../../../menus/menu/_types/IMenuItemExecuteCallback";
import {createAction} from "../../createAction";
import {IItemKeyHandler} from "./_types/IItemKeyHandler";

export const keyHandlerAction = createAction({
    name: "key handler",
    core: (listeners: IItemKeyHandler[]) => {
        /**
         * Emits a key event to all listeners, and returns whether propagation was stopped
         * @param event The event to emit
         * @param menu The menu that the item is in that forwarded this event
         * @param onExecute The item execution listener for the menu
         * @returns Whether the propagation was stopped
         */
        async function emit(
            event: KeyEvent,
            menu: IMenu,
            onExecute?: IMenuItemExecuteCallback
        ): Promise<{
            /** Stops propagation to handlers with lower priority (down the handler stack) */
            stopPropagation: boolean;
            /** Stops propagation to handlers with the same priority (other item handlers) */
            stopImmediatePropagation: boolean;
        }> {
            let stopPropagation = false;
            let stopImmediatePropagation = false;
            for (let {onKey} of listeners) {
                // Forward the event
                const res = await onKey(event, menu, onExecute);

                // Handle catch data
                if (res instanceof Object) {
                    if (res.stopPropagation) stopPropagation = true;
                    if (res.stopImmediatePropagation) {
                        stopPropagation = true;
                        stopImmediatePropagation = true;
                        break;
                    }
                } else if (res) {
                    stopPropagation = true;
                }
            }

            return {stopPropagation, stopImmediatePropagation};
        }

        return {
            result: {
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
                    onExecute?: IMenuItemExecuteCallback
                ): Promise<boolean> {
                    const result = await emit(event, menu, onExecute);
                    return result.stopPropagation;
                },
                emitRaw: emit,
            },
        };
    },
});

import {IKeyEventListener, IKeyEventListenerObject} from "./_types/IKeyEventListener";
import {KeyEvent} from "./KeyEvent";

/**
 * Merges the given key listeners
 * @param handlers
 */
export function mergeKeyListeners(
    ...handlers: IKeyEventListener[]
): IKeyEventListenerObject {
    return {
        emit: async (event: KeyEvent) => {
            for (let handler of handlers) {
                if ("emit" in handler) {
                    if (await handler.emit(event)) return true;
                } else {
                    if (handler(event)) return true;
                }
            }
        },
        destroy: () =>
            handlers.forEach(handler => "destroy" in handler && handler.destroy?.()),
    };
}

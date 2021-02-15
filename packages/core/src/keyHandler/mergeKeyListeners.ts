import {IKeyEventListener} from "./_types/IKeyEventListener";
import {KeyEvent} from "./KeyEvent";

/**
 * Merges the given key listeners
 * @param handlers The handlers to merge
 * @returns A key listener that merged the passed handlers in the given order
 */
export function mergeKeyListeners(
    ...handlers: (IKeyEventListener | undefined)[]
): IKeyEventListener {
    const normalizedHandlers = handlers.filter(
        (handler): handler is IKeyEventListener => !!handler
    );
    if (normalizedHandlers.length == 1) return normalizedHandlers[0];

    return async (event: KeyEvent) => {
        for (let handler of normalizedHandlers) {
            if (await handler(event)) return true;
        }
    };
}

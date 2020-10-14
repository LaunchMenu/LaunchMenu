import {KeyEvent} from "../../keyHandler/KeyEvent";
import {IKeyEventListenerFunction} from "../../keyHandler/_types/IKeyEventListener";
import {IIOContext} from "../_types/IIOContext";

/**
 * Emits a key event on a given context's key handler stack
 * @param context The context to emit the event on
 * @param event The event to be emitted
 * @returns The result of the event
 */
export async function emitContextEvent(
    context: IIOContext,
    event: KeyEvent
): Promise<boolean> {
    const layers = context.getUI();
    for (var i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        const handlers = layer.getKeyHandlers();
        for (var j = handlers.length - 1; j >= 0; j--) {
            let handler = handlers[j];
            if (!(handler instanceof Function))
                handler = handler.emit.bind(handler) as IKeyEventListenerFunction;
            if (await handler(event)) return true;
        }
    }
    return false;
}

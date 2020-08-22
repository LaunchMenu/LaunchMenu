import {IOpenableKeyHandler} from "../_types/IOpenableKeyHandler";
import {withRemoveError} from "../withPopError";
import {IIOContext} from "../_types/IIOContext";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The key handler data to be opened
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openKeyHandler(
    context: IIOContext,
    content: IOpenableKeyHandler
): (() => void)[] {
    const closers = [] as (() => void)[];
    let keyHandler = content.keyHandler;
    if (keyHandler) {
        if (!(keyHandler instanceof Array)) keyHandler = [keyHandler];

        // Open each of the handlers in the array
        keyHandler.forEach(handler => {
            context.keyHandler.push(handler);
            closers.unshift(() =>
                withRemoveError(context.keyHandler.remove(handler), "key handler")
            );
        });

        // Destroy the handlers on close if requested
        if (content.destroyOnClose != false)
            keyHandler.forEach(handler => {
                if (!(handler instanceof Function) && handler.destroy)
                    closers.unshift(() => handler.destroy?.());
            });
    }

    return closers;
}

import {IOpenableKeyHandler} from "../_types/IOpenableKeyHandler";
import {TPartialContextFromContent} from "../_types/TPartialContextFromContent";
import {containsKeyHandlerStack} from "../partialContextChecks/containsKeyHandlerStack";
import {withPopError} from "../withPopError";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The key handler data to be opened
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openKeyHandler<D extends IOpenableKeyHandler>(
    context: TPartialContextFromContent<D>,
    content: D & IOpenableKeyHandler
): (() => void)[] {
    const closers = [] as (() => void)[];
    const keyHandler = content.keyHandler;
    if (keyHandler && containsKeyHandlerStack(context)) {
        if (keyHandler instanceof Array) {
            // Open each of the handlers in the array
            keyHandler.forEach(handler => {
                context.keyHandler.push(handler);
                closers.unshift(() =>
                    withPopError(context.keyHandler.pop(handler), "key handler")
                );
            });
        } else {
            // Open the handler
            context.keyHandler.push(keyHandler);
            closers.unshift(() =>
                withPopError(context.keyHandler.pop(keyHandler), "key handler")
            );
        }
    }

    return closers;
}

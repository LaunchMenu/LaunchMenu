import {IOpenableUI} from "../_types/IOpenableUI";
import {TPartialContextFromContent} from "../_types/TPartialContextFromContent";
import {openMenu} from "./openMenu";
import {openKeyHandler} from "./openKeyHandler";
import {openTextField} from "./openTextField";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The content to be opened
 * @param onClose A callback that gets triggered when the opened UI gets closed
 * @returns A function to close the opened content, returns false if it was already closed
 */
export function openUI<D extends IOpenableUI>(
    context: TPartialContextFromContent<D>,
    content: D,
    onClose?: () => void
): () => boolean {
    // Create the function to close everything
    const closers = [] as (() => void)[];
    let closed = false;
    const close = () => {
        if (closed) return false;

        closed = true;
        let errors = [] as any[];
        closers.forEach(close => {
            try {
                close();
            } catch (e) {
                errors.push(e);
            }
        });
        if (errors.length) throw errors[0];

        onClose?.();
        return true;
    };

    // Open all requested elements
    const closeMenu = openMenu(context, content, close);
    if (closeMenu) closers.unshift(...closeMenu);

    const closeTextField = openTextField(context, content, close);
    if (closeTextField) closers.unshift(...closeTextField);

    const closeKeyHandlers = openKeyHandler(context, content);
    if (closeKeyHandlers) closers.unshift(...closeKeyHandlers);

    // Returning the closing function
    return close;
}

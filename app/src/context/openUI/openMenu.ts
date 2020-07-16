import {TPartialContextFromContent} from "../_types/TPartialContextFromContent";
import {IOpenableMenu} from "../_types/IOpenableMenu";
import {containsMenuStack} from "../partialContextChecks/containsMenuStack";
import {isView, IViewStackItem} from "../../stacks/_types/IViewStackItem";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The menu to be opened
 * @returns A function to close the opened content, returns false if something couldn't be closed
 */
export function openMenu<D extends IOpenableMenu>(
    context: TPartialContextFromContent<D>,
    content: D
): (() => boolean) | undefined {
    const closers = [] as (() => boolean)[];
    if (content.menu && containsMenuStack(context)) {
        const {menu} = content;
        // Handle opening of just a menu view
        if (isView(menu)) {
            context.panes.menu.push(menu);
            closers.unshift(() => context.panes.menu.pop(menu));
        } else {
            // Handle creating of menu components
            let view: IViewStackItem;
            if (!("menuView" in content)) {
            }
        }
    }
    return () => true;
}

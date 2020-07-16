import {IOpenableUI} from "../_types/IOpenableUI";
import {TPartialContextFromContent} from "../_types/TPartialContextFromContent";
import {IStack} from "../../stacks/_types/IStack";
import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {TDeepPick} from "../../_types/TDeepPick";
import {TDeepPartial} from "../../_types/TDeepPartial";
import {IIOContext} from "../_types/IIOContext";
import {containsMenuStack} from "../partialContextChecks/containsMenuStack";
import {openMenu} from "./openMenu";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The content to be opened
 * @returns A function to close the opened content
 */
export function open<D extends IOpenableUI>(
    context: TPartialContextFromContent<D>,
    content: D
): () => void {
    const closers = [] as (() => boolean)[];

    const closeMenu = openMenu(context, content);
    if (closeMenu) closers.unshift(...closers);

    return () => {};
}

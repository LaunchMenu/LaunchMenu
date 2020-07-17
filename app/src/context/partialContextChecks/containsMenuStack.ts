import {TDeepPartial} from "../../_types/TDeepPartial";
import {IIOContext} from "../_types/IIOContext";
import {TDeepPick} from "../../_types/TDeepPick";

/**
 * Checks whether the given context contains a menu stack
 * @param context The context to check
 * @returns Whether the context contains a menu stack
 */
export function containsMenuStack(
    context: TDeepPartial<IIOContext>
): context is TDeepPick<IIOContext, {panes: {menu: true}}> {
    return !!context.panes && "menu" in context.panes;
}

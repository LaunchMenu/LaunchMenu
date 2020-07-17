import {TDeepPartial} from "../../_types/TDeepPartial";
import {IIOContext} from "../_types/IIOContext";
import {TDeepPick} from "../../_types/TDeepPick";

/**
 * Checks whether the given context contains a field stack
 * @param context The context to check
 * @returns Whether the context contains a field stack
 */
export function containsFieldStack(
    context: TDeepPartial<IIOContext>
): context is TDeepPick<IIOContext, {panes: {field: true}}> {
    return !!context.panes && "field" in context.panes;
}

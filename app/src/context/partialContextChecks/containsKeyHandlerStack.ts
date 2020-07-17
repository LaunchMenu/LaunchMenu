import {TDeepPartial} from "../../_types/TDeepPartial";
import {IIOContext} from "../_types/IIOContext";
import {TDeepPick} from "../../_types/TDeepPick";

/**
 * Checks whether the given context contains a key handler stack
 * @param context The context to check
 * @returns Whether the context contains a key handler stack
 */
export function containsKeyHandlerStack(
    context: TDeepPartial<IIOContext>
): context is TDeepPick<IIOContext, {keyHandler: true}> {
    return !!context.keyHandler;
}

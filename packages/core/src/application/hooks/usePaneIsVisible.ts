import {useLayoutEffect, useRef} from "react";
import {IViewStack} from "../../stacks/viewStack/_types/IViewStack";
import {IViewStackItem} from "../../stacks/viewStack/_types/IViewStackItem";
import {IIdentifiedItem} from "../../stacks/_types/IIdentifiedItem";
import {useDataHook} from "../../utils/modelReact/useDataHook";

/**
 * Checks whether the pane for a viewstack should be visible
 * @param stack The stack of items for which to check whether the pane should be visible
 * @param defaultTransitionDuration The duration of the open/close transition
 * @returns WHether the pane should be open, and possible transition durations
 */
export function usePaneIsVisible(
    stack: IViewStack,
    defaultTransitionDuration = 150
): {open: boolean; prevOpen: boolean; duration: number} {
    const state = useRef({
        open: true,
        prevOpen: true,
        duration: defaultTransitionDuration,
        prevTop: undefined as IIdentifiedItem<IViewStackItem> | undefined,
    });
    const [h] = useDataHook();
    const top = stack.getTop(h);
    state.current.prevOpen = state.current.open;
    if (state.current.prevTop != top) {
        state.current.prevTop = top;
        state.current.open = true;
        if (top) {
            const topItem = top?.value;
            if (topItem && "close" in topItem) {
                state.current.open = false;
                state.current.duration =
                    topItem.closeTransitionDuration ?? defaultTransitionDuration;
            }
        }
    }
    return state.current;
}

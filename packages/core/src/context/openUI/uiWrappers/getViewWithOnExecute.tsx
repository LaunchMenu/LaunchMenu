import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {injectIntoView} from "./injectIntoView";

/**
 * Retrieves a view item, with the onExecute property replaced
 * @param view The view to replace the onExecute property in, or forward it to (if component)
 * @param onExecute The onExecute callback to be used
 * @returns The new view stack item
 */
export function getViewWithOnExecute(
    view: IViewStackItem,
    onExecute?: () => void
): IViewStackItem {
    return injectIntoView(view, {onExecute});
}

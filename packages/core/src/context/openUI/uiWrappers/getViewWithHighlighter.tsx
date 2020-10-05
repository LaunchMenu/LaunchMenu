import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {IHighlighter} from "../../../textFields/syntax/_types/IHighlighter";
import {injectIntoView} from "./injectIntoView";

/**
 * Retrieves a view item, with the highlighter property replaced
 * @param view The view to replace the highlighter property in, or forward it to (if component)
 * @param highlighter The highlighter to be used
 * @returns The new view stack item
 */
export function getViewWithHighlighter(
    view: IViewStackItem,
    highlighter: IHighlighter
): IViewStackItem {
    return injectIntoView(view, {highlighter});
}

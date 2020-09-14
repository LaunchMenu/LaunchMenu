import {IViewStackItem} from "../../stacks/viewStack/_types/IViewStackItem";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";
import {getViewStackItemElement} from "../../components/stacks/getViewStackItemElement";
import {IViewStackItemProps} from "../../stacks/viewStack/_types/IViewStackItemProps";

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
    if ("close" in view) return view;
    else if ("view" in view)
        return {
            ...view,
            view: props =>
                getViewStackItemElement(view.view, {
                    ...props,
                    highlighter,
                } as IViewStackItemProps),
        };
    else
        return props =>
            getViewStackItemElement(view, {...props, highlighter} as IViewStackItemProps);
}

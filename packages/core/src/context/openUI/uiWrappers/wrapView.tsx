import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {getViewStackItemElement} from "../../../components/stacks/getViewStackItemElement";

/**
 * Retrieves a view item, with the view itself wrapped
 * @param view The item view to be wrapped
 * @param wrap The function to wrap the view with
 * @returns The new view stack item
 */
export function wrapView(
    view: IViewStackItem,
    wrap: (el: JSX.Element) => JSX.Element
): IViewStackItem {
    if ("close" in view) return view;
    else if ("view" in view)
        return {
            ...view,
            view: props => wrap(getViewStackItemElement(view.view, props)),
        };
    else return props => wrap(getViewStackItemElement(view, props));
}

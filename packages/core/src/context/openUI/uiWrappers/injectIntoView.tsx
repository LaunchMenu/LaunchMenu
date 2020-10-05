import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {getViewStackItemElement} from "../../../components/stacks/getViewStackItemElement";

/**
 * Retrieves a view item, with the extra properties injected
 * @param view The item view to inject data into
 * @param extraProps The propecties to inject
 * @returns The new view stack item
 */
export function injectIntoView(view: IViewStackItem, extraProps: object): IViewStackItem {
    if ("close" in view) return view;
    else if ("view" in view)
        return {
            ...view,
            view: props => getViewStackItemElement(view.view, {...props, ...extraProps}),
        };
    else return props => getViewStackItemElement(view, {...props, ...extraProps});
}

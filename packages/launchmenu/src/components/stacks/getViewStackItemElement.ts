import {IViewStackItemProps} from "../../stacks/viewStack/_types/IViewStackItemProps";
import {IViewStackItemView} from "../../stacks/viewStack/_types/IViewStackItem";
import {cloneElement, createElement} from "react";

/**
 * Obtains the view stack item element for the given props
 * @param element The element or component to obtain a jsx element
 * @param props The props to add to the element
 * @returns The jsx element
 */
export function getViewStackItemElement(
    element: IViewStackItemView,
    props: IViewStackItemProps
): JSX.Element {
    return element instanceof Function
        ? createElement(element, props)
        : cloneElement(element, props);
}

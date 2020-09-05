import React from "react";
import {IViewStackItem} from "../../stacks/viewStack/_types/IViewStackItem";
import {IIOContext} from "../_types/IIOContext";
import {IOContextProvider} from "../react/IOContextContext";
import {getViewStackItemElement} from "../../components/stacks/getViewStackItemElement";

/**
 * Retrieves a view that's identical to the passed view, except it's wrapped in a IOContext provider
 * @param view The view to be augmented with the context
 * @param context The context to augment the view with
 * @returns The augmented view
 */
export function getViewWithContext(
    view: IViewStackItem,
    context: IIOContext
): IViewStackItem {
    if ("close" in view) return view;
    if ("view" in view)
        return {
            ...view,
            view: props => (
                <IOContextProvider value={context}>
                    {getViewStackItemElement(view.view, props)}
                </IOContextProvider>
            ),
        };
    else
        return props => (
            <IOContextProvider value={context}>
                {getViewStackItemElement(view, props)}
            </IOContextProvider>
        );
}

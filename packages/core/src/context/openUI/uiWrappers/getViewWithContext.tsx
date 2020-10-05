import React from "react";
import {IViewStackItem} from "../../../stacks/viewStack/_types/IViewStackItem";
import {IIOContext} from "../../_types/IIOContext";
import {IOContextProvider} from "../../react/IOContextContext";
import {wrapView} from "./wrapView";

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
    return wrapView(view, el => (
        <IOContextProvider value={context}>{el}</IOContextProvider>
    ));
}

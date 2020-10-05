import React from "react";
import {isView} from "../../stacks/viewStack/_types/IViewStackItem";
import {withRemoveError} from "../withRemoveError";
import {IIOContext} from "../_types/IIOContext";
import {IOpenableContent} from "../_types/IOpenableContent";
import {getViewWithContext} from "./uiWrappers/getViewWithContext";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param data The content data to be opened
 * @param close A function to close the opened UI
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openContent(
    context: IIOContext,
    data: IOpenableContent,
    close?: () => void
): (() => void)[] {
    const closers = [] as (() => void)[];
    if (data.content) {
        const {content} = data;

        // Handle opening if only a content view
        if (isView(content)) {
            const wrappedContent = content; //getViewWithContext(content, context);
            context.panes.content.push(wrappedContent);
            closers.unshift(() =>
                withRemoveError(context.panes.content.remove(wrappedContent), "content")
            );
        }
        // Handle opening, and possibly creating, of content view and key handlers
        else {
            // TODO: figure out a standard format
        }
    }

    return closers;
}

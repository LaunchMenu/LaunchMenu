import React, {cloneElement} from "react";
import {isView, IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {withRemoveError} from "../withRemoveError";
import {IOpenableField} from "../_types/IOpenableField";
import {createTextFieldKeyHandler} from "../../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {TextFieldView} from "../../components/fields/TextFieldView";
import {IIOContext} from "../_types/IIOContext";
import {getViewWithContext} from "./getViewWithContext";
import {getViewWithHighlighter} from "./getViewWithHighlighter";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The text field data to be opened
 * @param close A function to close the opened UI
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openTextField(
    context: IIOContext,
    content: IOpenableField,
    close?: () => void
): (() => void)[] {
    const closers = [] as (() => void)[];
    if (content.field) {
        const {field} = content;

        // Handle opening if only a text field view
        if (isView(field)) {
            const wrappedField = getViewWithContext(field, context);
            context.panes.field.push(wrappedField);
            closers.unshift(() =>
                withRemoveError(context.panes.field.remove(wrappedField), "field")
            );
        }
        // Handle opening, and possibly creating, of field view and key handlers
        else {
            // Handle creating of field components
            let view: IViewStackItem;
            if ("fieldView" in content && content.fieldView)
                view = getViewWithContext(content.fieldView, context);
            else {
                let rawView: IViewStackItem;
                if (field.view)
                    rawView =
                        "highlighter" in content && content.highlighter
                            ? getViewWithHighlighter(field.view, content.highlighter)
                            : field.view;
                else
                    rawView = (
                        <TextFieldView
                            field={field}
                            icon={"icon" in content ? content.icon : undefined}
                            highlighter={
                                "highlighter" in content ? content.highlighter : undefined
                            }
                        />
                    );
                view = getViewWithContext(rawView, context);
            }

            let keyHandler: IKeyEventListener;
            if ("fieldHandler" in content && content.fieldHandler)
                keyHandler = content.fieldHandler;
            else keyHandler = createTextFieldKeyHandler(field, false, close);

            // Handle opening of field components
            context.panes.field.push(view);
            closers.unshift(() =>
                withRemoveError(context.panes.field.remove(view), "field")
            );

            context.keyHandler.push(keyHandler);
            closers.unshift(() =>
                withRemoveError(context.keyHandler.remove(keyHandler), "key handler")
            );

            // Destroy the menu on close if specified
            if (!("destroyOnClose" in content) || content.destroyOnClose) {
                closers.unshift(() => field.destroy?.());

                const kh = keyHandler;
                if (!(kh instanceof Function) && kh.destroy)
                    closers.unshift(() => kh.destroy?.());
            }

            // Let the field know when it has been opened and closed
            field.addViewCount();
            closers.unshift(() => field.removeViewCount());
        }
    }

    return closers;
}

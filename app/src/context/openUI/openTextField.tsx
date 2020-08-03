import React from "react";
import {TPartialContextFromContent} from "../_types/TPartialContextFromContent";
import {IOpenableMenu} from "../_types/IOpenableMenu";
import {containsMenuStack} from "../partialContextChecks/containsMenuStack";
import {isView, IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {MenuView} from "../../components/menu/MenuView";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {createMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {containsKeyHandlerStack} from "../partialContextChecks/containsKeyHandlerStack";
import {withPopError} from "../withPopError";
import {IOpenableField} from "../_types/IOpenableField";
import {containsFieldStack} from "../partialContextChecks/containsFieldStack";
import {createTextFieldKeyHandler} from "../../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {TextFieldView} from "../../components/fields/TextFieldView";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The text field data to be opened
 * @param close A function to close the opened UI
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openTextField<D extends IOpenableField>(
    context: TPartialContextFromContent<D>,
    content: D & IOpenableField,
    close?: () => void
): (() => void)[] {
    const closers = [] as (() => void)[];
    if (content.field && containsFieldStack(context)) {
        const {field} = content;

        // Handle opening if only a text field view
        if (isView(field)) {
            context.panes.field.push(field);
            closers.unshift(() => withPopError(context.panes.field.pop(field), "field"));
        }
        // Handle opening, and possibly creating, of field view and key handlers
        else if (containsKeyHandlerStack(context)) {
            // Handle creating of field components
            let view: IViewStackItem;
            if ("fieldView" in content && content.fieldView) view = content.fieldView;
            else
                view = (
                    <TextFieldView
                        field={field}
                        icon={"icon" in content ? content.icon : undefined}
                        highlighter={
                            "highlighter" in content ? content.highlighter : undefined
                        }
                    />
                );

            let keyHandler: IKeyEventListener;
            if ("fieldHandler" in content && content.fieldHandler)
                keyHandler = content.fieldHandler;
            else keyHandler = createTextFieldKeyHandler(field, false, close);

            // Handle opening of field components
            context.panes.field.push(view);
            closers.unshift(() => withPopError(context.panes.field.pop(view), "field"));

            context.keyHandler.push(keyHandler);
            closers.unshift(() =>
                withPopError(context.keyHandler.pop(keyHandler), "key handler")
            );

            // Destroy the menu on close if specified
            if (!("destroyOnClose" in content) || content.destroyOnClose)
                closers.unshift(() => field.destroy?.());
        }
    }

    return closers;
}

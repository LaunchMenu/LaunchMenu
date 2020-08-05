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
import {openTextField} from "./openTextField";
import {SearchField} from "../../textFields/SearchField";
import {containsFieldStack} from "../partialContextChecks/containsFieldStack";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The menu data to be opened
 * @param close A function to close the opened UI
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openMenu<D extends IOpenableMenu>(
    context: TPartialContextFromContent<D>,
    content: D & IOpenableMenu,
    close?: () => void
): (() => void)[] {
    const closers = [] as (() => void)[];
    if (content.menu && containsMenuStack(context)) {
        const {menu} = content;

        // Handle opening if only a menu view
        if (isView(menu)) {
            context.panes.menu.push(menu);
            closers.unshift(() => withPopError(context.panes.menu.pop(menu), "menu"));
        }
        // Handle opening, and possibly creating, of menu view and key handlers
        else if (containsKeyHandlerStack(context)) {
            // Handle creating of menu components
            let view: IViewStackItem;
            if ("menuView" in content && content.menuView) view = content.menuView;
            else view = <MenuView menu={menu} />;

            let keyHandler: IKeyEventListener;
            if ("menuHandler" in content && content.menuHandler)
                keyHandler = content.menuHandler;
            else keyHandler = createMenuKeyHandler(menu, context, {onExit: close});

            // Handle opening of menu components
            context.panes.menu.push(view);
            closers.unshift(() => withPopError(context.panes.menu.pop(view), "menu"));

            context.keyHandler.push(keyHandler);
            closers.unshift(() =>
                withPopError(context.keyHandler.pop(keyHandler), "key handler")
            );

            // Destroy the menu on close if specified
            if (!("destroyOnClose" in content) || content.destroyOnClose) {
                closers.unshift(() => menu.destroy());
                const kh = keyHandler;
                if (!(kh instanceof Function) && kh.destroy)
                    closers.unshift(() => kh.destroy?.());
            }

            // If no field is present, and search is true or not specified, create a search field
            if (
                !("field" in content) &&
                (!("searchable" in content) || content.searchable)
            ) {
                if (containsFieldStack(context)) {
                    closers.unshift(
                        ...openTextField(context, {
                            field: new SearchField({menu, context}),
                            highlighter:
                                "highlighter" in content
                                    ? content.highlighter
                                    : undefined,
                            icon: {iconName: "Search"},
                            destroyOnClose: true, // Caller has no reference to this field so can't manually destroy it
                        })
                    );
                }
            }
        }
    }

    return closers;
}

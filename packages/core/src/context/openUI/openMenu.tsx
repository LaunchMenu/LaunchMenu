import React from "react";
import {IOpenableMenu} from "../_types/IOpenableMenu";
import {isView, IViewStackItem} from "../../stacks/viewStack/_types/IViewStackItem";
import {MenuView} from "../../components/menu/MenuView";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {createMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {withRemoveError} from "../withRemoveError";
import {openTextField} from "./openTextField";
import {SearchField} from "../../textFields/types/searchField/SearchField";
import {isIOContext, IIOContext} from "../_types/IIOContext";
import {getViewWithContext} from "./getViewWithContext";
import {IMenu} from "../../menus/menu/_types/IMenu";

/**
 * Opens the given content within the given ui context
 * @param context The context to open the content in
 * @param content The menu data to be opened
 * @param close A function to close the opened UI
 * @returns An array of functions that can be executed in sequence to close the opened ui elements
 */
export function openMenu(
    context: IIOContext,
    content: IOpenableMenu,
    close?: () => void
): (() => void)[] {
    const closers = [] as (() => void)[];
    if (content.menu) {
        const {menu} = content;

        // Handle opening if only a menu view
        if (isView(menu)) {
            const wrappedMenu = getViewWithContext(menu, context);
            context.panes.menu.push(wrappedMenu);
            closers.unshift(() =>
                withRemoveError(context.panes.menu.remove(wrappedMenu), "menu")
            );
        }
        // Handle opening, and possibly creating, of menu view and key handlers
        else {
            // Handle creating of menu components
            let view: IViewStackItem;
            if ("menuView" in content && content.menuView)
                view = getViewWithContext(content.menuView, context);
            else
                view = getViewWithContext(menu.view ?? <MenuView menu={menu} />, context);

            let keyHandler: IKeyEventListener | undefined;
            if ("menuHandler" in content && content.menuHandler)
                keyHandler = content.menuHandler;
            else if (isIOContext(context))
                keyHandler = createMenuKeyHandler(menu, {
                    onExit:
                        !("closable" in content) || content.closable ? close : undefined,
                    onExecute: "onExecute" in content ? content.onExecute : undefined,
                });

            // Handle opening of menu components
            context.panes.menu.push(view);
            closers.unshift(() =>
                withRemoveError(context.panes.menu.remove(view), "menu")
            );

            if (keyHandler) {
                const kh = keyHandler;
                context.keyHandler.push(kh);
                closers.unshift(() =>
                    withRemoveError(context.keyHandler.remove(kh), "key handler")
                );
            }

            // Destroy the menu on close if specified
            if (!("destroyOnClose" in content) || content.destroyOnClose) {
                closers.unshift(() => menu.destroy?.());
                const kh = keyHandler;
                if (kh && !(kh instanceof Function) && kh.destroy)
                    closers.unshift(() => kh.destroy?.());
            }

            // If no field is present, and search is true or not specified, create a search field
            if (
                !("field" in content) &&
                (!("searchable" in content) || content.searchable)
            ) {
                closers.unshift(
                    ...openTextField(context, {
                        field: new SearchField({menu, context}),
                        highlighter:
                            "highlighter" in content ? content.highlighter : undefined,
                        icon: "search",
                        destroyOnClose: true, // Caller has no reference to this field so can't manually destroy it
                    })
                );
            }

            // Let the menu know when it has been opened and closed
            menu.addViewCount();
            closers.unshift(() => menu.removeViewCount());
        }
    }

    return closers;
}

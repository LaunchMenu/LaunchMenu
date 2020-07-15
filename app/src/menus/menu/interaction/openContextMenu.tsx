import React from "react";
import {IMenu} from "../_types/IMenu";
import {ViewStack} from "../../../stacks/ViewStack";
import {KeyHandlerStack} from "../../../stacks/keyHandlerStack/KeyHandlerStack";
import {getContextMenu} from "../../utils/getContextMenu";
import {createMenuKeyHandler} from "./keyHandler/createMenuKeyHandler";
import {MenuView} from "../MenuView";

/**
 * Opens a context menu for the selection of the given menu
 * @param menu The menu to perform the event for
 * @param viewStack The view stack to add the context menu to
 * @param inputStack The key input handler stack
 */
export function openContextMenu(
    menu: IMenu,
    viewStack: ViewStack,
    inputStack: KeyHandlerStack
): void {
    const close = () => {
        viewStack.pop(view);
        inputStack.pop(keyHandler);
    };
    const contextMenu = getContextMenu(menu.getAllSelected(), close);
    if (contextMenu.getItems().length == 0) return;

    const view = <MenuView menu={contextMenu} />;
    const keyHandler = createMenuKeyHandler(contextMenu, viewStack, inputStack, close);
    viewStack.push(view);
    inputStack.push(keyHandler);
}

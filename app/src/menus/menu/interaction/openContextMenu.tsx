import React from "react";
import {IMenu} from "../_types/IMenu";
import {getContextMenu} from "../../utils/getContextMenu";
import {IViewStack} from "../../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {openUI} from "../../../context/openUI/openUI";

/**
 * Opens a context menu for the selection of the given menu
 * @param menu The menu to perform the event for
 * @param ioContext The IO context to use to open the context menu
 */
export function openContextMenu(
    menu: IMenu,
    ioContext: {panes: {menu: IViewStack}; keyHandler: IKeyHandlerStack}
): void {
    let close = () => {}; // placeholder
    const contextMenu = getContextMenu(menu.getAllSelected(), () => close());
    if (contextMenu.getItems().length > 0) close = openUI(ioContext, {menu: contextMenu});
}

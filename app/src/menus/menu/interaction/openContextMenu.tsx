import {IMenu} from "../_types/IMenu";
import {getContextMenuItems} from "../../utils/getContextMenu";
import {IViewStack} from "../../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {openUI} from "../../../context/openUI/openUI";
import {Menu} from "../Menu";
import {IUndoRedoFacility} from "../../../undoRedo/_types/IUndoRedoFacility";

/**
 * Opens a context menu for the selection of the given menu
 * @param menu The menu to perform the event for
 * @param ioContext The IO context to use to open the context menu
 */
export function openContextMenu(
    menu: IMenu,
    ioContext: {
        panes: {menu: IViewStack; field: IViewStack};
        keyHandler: IKeyHandlerStack;
        undoRedo: IUndoRedoFacility;
    }
): void {
    let close = () => {}; // placeholder
    const contextMenuItems = getContextMenuItems(menu.getAllSelected(), () => close());
    if (contextMenuItems.length > 0)
        close = openUI(ioContext, {menu: new Menu(contextMenuItems)});
}

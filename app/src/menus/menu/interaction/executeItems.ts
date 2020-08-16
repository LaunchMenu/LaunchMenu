import {IUndoRedoFacility} from "../../../undoRedo/_types/IUndoRedoFacility";
import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {executeAction} from "../../actions/types/execute/executeAction";

/**
 * Executes the default actions of the selected items of the menu
 * @param menu The menu for which to execute the items
 * @param undoRedo The undo redo facility to dispatch commands in
 */
export async function executeItems(
    menu: IMenu,
    undoRedo: IUndoRedoFacility
): Promise<void>;

/**
 * Executes the default actions of specified items
 * @param items The items for which to execute the default action
 * @param undoRedo The undo redo facility to dispatch commands in
 */
export async function executeItems(
    items: IMenuItem[],
    undoRedo: IUndoRedoFacility
): Promise<void>;
export async function executeItems(
    menu: IMenu | IMenuItem[],
    undoRedo: IUndoRedoFacility
): Promise<void> {
    const cmd = await executeAction
        .get("getAllSelected" in menu ? menu.getAllSelected() : menu)
        .execute();
    if (cmd) undoRedo.execute(cmd);
}

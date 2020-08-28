import {IUndoRedoFacility} from "../../../undoRedo/_types/IUndoRedoFacility";
import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {executeAction} from "../../actions/types/execute/executeAction";
import {IIOContext} from "../../../context/_types/IIOContext";

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
 * @param context The context the items can use
 * @param items The items for which to execute the default action
 * @param undoRedo The undo redo facility to dispatch commands in
 */
export async function executeItems(
    context: IIOContext,
    items: IMenuItem[],
    undoRedo: IUndoRedoFacility
): Promise<void>;
export async function executeItems(
    context: IMenu | IIOContext,
    items: IMenuItem[] | IUndoRedoFacility,
    undoRedo?: IUndoRedoFacility
): Promise<void> {
    if ("getAllSelected" in context) {
        const cmd = await executeAction
            .get(context.getAllSelected())
            .execute({context: context.getContext()});
        if (cmd) (items as IUndoRedoFacility).execute(cmd);
    } else {
        const cmd = await executeAction.get(items as IMenuItem[]).execute({context});
        if (cmd) (undoRedo as IUndoRedoFacility).execute(cmd);
    }
}

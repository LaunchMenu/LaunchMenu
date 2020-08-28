import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {IUndoRedoFacility} from "../../../../undoRedo/_types/IUndoRedoFacility";
import {executeItems} from "../executeItems";

/**
 * Handles execute input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param undoRedo The undo redo facility
 * @returns Whether the event was caught
 */
export function handleExecuteInput(
    event: KeyEvent,
    menu: IMenu,
    undoRedo: IUndoRedoFacility
): void | boolean {
    if (event.is("enter")) {
        executeItems(menu, undoRedo);
        return true;
    }
}

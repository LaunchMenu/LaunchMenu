import {createStandardMenuItem, getControlsCategory, IMenuItem} from "@launchmenu/core";
import {NotesSource} from "../../dataModel/NotesSource";
import {addNoteExecuteHandler} from "../actionHandlers/addNoteExecuteHandler";
import {IAddNoteCallback} from "../actionHandlers/_types/IAddNoteExecuteData";

/**
 * Creates a new menu item to add new notes
 * @param notesSource The notes source to add the item to
 * @param onCreate A callback for when a note is created
 * @returns The menu item that can be used to create new notes
 */
export function createAddNoteMenuItem(
    notesSource: NotesSource,
    onCreate: IAddNoteCallback = () => Promise.resolve()
): IMenuItem {
    return createStandardMenuItem({
        name: "Add note",
        category: getControlsCategory(),
        actionBindings: [
            addNoteExecuteHandler.createBinding({notesSource, callback: onCreate}),
        ],
    });
}

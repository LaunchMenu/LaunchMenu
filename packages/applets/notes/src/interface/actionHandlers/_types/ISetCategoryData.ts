import {Note} from "../../../dataModel/Note";
import {NoteCategory} from "../../../dataModel/NoteCategory";

/** The data for the set category action */
export type ISetCategoryData = {
    note: Note;
    options: NoteCategory[];
};

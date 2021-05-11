import {IInherit} from "../dataModel/_types/IInherit";
import {INoteCategoryMetadata} from "../dataModel/_types/INoteCategoryMetadata";
import {INoteAppearanceMetadata} from "../dataModel/_types/INoteAppearanceMetadata";
import {promises as FS, existsSync} from "fs";
import Path from "path";
import {LaunchMenu, wait} from "@launchmenu/core";
import {settings} from "../settings";
import {v4 as uuid} from "uuid";

/**
 * Sets up the notes
 * @param config The configuration for the notes to add
 * @returns A function that can be invoked to restore the previous notes
 */
export async function setupNotes({
    LM,
    notes,
    categories,
}: {
    /** The LM instance to retrieve data from */
    LM: LaunchMenu;
    /** The notes to be added */
    notes: ({name: string; content: string; categoryID?: string} & Partial<
        INoteAppearanceMetadata<IInherit>
    >)[];
    /** The categories to be added */
    categories: INoteCategoryMetadata[];
}): Promise<() => Promise<void>> {
    // Obtain the notes json file
    const {notesDir} = LM.getSettingsManager().getSettingsContext().get(settings);
    const dir = notesDir.get();
    const notesPath = Path.join(dir, "notes.json");

    // Rename the old notes file
    let id = 1;
    while (existsSync(Path.join(dir, `notes-BU${id}.json`))) id++;
    const notesBUPath = Path.join(dir, `notes-BU${id}.json`);
    if (existsSync(notesPath)) await FS.rename(notesPath, notesBUPath);

    // Create files for each of the notes
    const tempNotesDir = Path.join(dir, "tempNotes");
    if (!existsSync(tempNotesDir)) await FS.mkdir(tempNotesDir, {recursive: true});
    const noteLocations = await Promise.all(
        notes.map(async ({content, ...rest}, i) => {
            const ID = uuid();
            const location = Path.join(tempNotesDir, `${ID}.txt`);
            await FS.writeFile(location, content);
            return {ID, location, modifiedAt: Date.now() + i * 10, ...rest};
        })
    );

    // Store the notes and categories in the notes file
    const notesContent = JSON.stringify({notes: noteLocations, categories}, null, 4);
    await FS.writeFile(notesPath, notesContent);

    // Return the function that can be used to restore the notes
    return async () => {
        await FS.unlink(notesPath);
        if (existsSync(notesBUPath)) await FS.rename(notesBUPath, notesPath);
        await wait(200);
        await FS.rmdir(tempNotesDir, {recursive: true});
    };
}

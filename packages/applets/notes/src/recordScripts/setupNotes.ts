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

    // Rename the old notes file
    let notesID = 1;
    while (existsSync(Path.join(dir, `notes-BU${notesID}.json`))) notesID++;
    const notesBUPath = Path.join(dir, `notes-BU${notesID}.json`);
    const notesPath = Path.join(
        dir,
        notesID == 1 ? "notes.json" : `notes-BU${notesID - 1}.json`
    );
    if (existsSync(notesPath)) await FS.rename(notesPath, notesBUPath);

    // Rename the old notes dir
    let dirID = 1;
    while (existsSync(Path.join(dir, `notes-BU${dirID}`))) dirID++;
    const dirBUPath = Path.join(dir, `notes-BU${dirID}`);
    const dirPath = Path.join(dir, notesID == 1 ? "notes" : `notes-BU${dirID - 1}`);
    if (existsSync(dirPath)) await FS.rename(dirPath, dirBUPath);

    // Create files for each of the notes
    const noteFilesDir = Path.join(dir, "notes");
    if (!existsSync(noteFilesDir)) await FS.mkdir(noteFilesDir, {recursive: true});
    const noteLocations = await Promise.all(
        notes.map(async ({content, ...rest}, i) => {
            const ID = uuid();
            const location = Path.join(noteFilesDir, `${ID}.txt`);
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
        if (existsSync(notesBUPath)) {
            const nextScriptStarted = existsSync(
                Path.join(dir, `notes-BU${notesID + 1}.json`)
            );
            if (!nextScriptStarted) await FS.rename(notesBUPath, notesPath);
        }
        await wait(200);
        await FS.rmdir(noteFilesDir, {recursive: true});
        if (existsSync(dirBUPath)) {
            const nextScriptStarted = existsSync(Path.join(dir, `notes-BU${dirID + 1}`));
            if (!nextScriptStarted) await FS.rename(dirBUPath, dirPath);
        }
    };
}

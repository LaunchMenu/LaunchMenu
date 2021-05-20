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

    const noteFilesDir = Path.join(dir, "notes");
    const notesPath = Path.join(dir, "notes.json");

    // Rename the old notes file
    const notesID =
        (await FS.readdir(dir))
            .map(dir => dir.match(/notes-BU(\d*)\.json/))
            .reduce((cur, match) => Math.max(match ? Number(match[1]) : 0, cur), 0) + 1;
    const notesBUPath = Path.join(dir, `notes-BU${notesID}.json`);
    const prevNotesPath = Path.join(
        dir,
        notesID == 1 ? "notes.json" : `notes-BU${notesID - 1}.json`
    );
    if (existsSync(prevNotesPath)) await FS.rename(prevNotesPath, notesBUPath);

    // Rename the old notes dir
    const dirID =
        (await FS.readdir(dir))
            .map(dir => dir.match(/notes-BU(\d*)$/))
            .reduce((cur, match) => Math.max(match ? Number(match[1]) : 0, cur), 0) + 1;
    const dirBUPath = Path.join(dir, `notes-BU${dirID}`);
    const prevDirPath = Path.join(dir, dirID == 1 ? "notes" : `notes-BU${dirID - 1}`);
    if (existsSync(prevDirPath)) await FS.rename(prevDirPath, dirBUPath);

    // Create files for each of the notes
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
        await wait(1000);
        if (existsSync(notesBUPath)) {
            const nextScriptStarted = existsSync(
                Path.join(dir, `notes-BU${notesID + 1}.json`)
            );
            if (!nextScriptStarted) {
                // Rename isn't picked up by the file watcher :/
                const content = await FS.readFile(notesBUPath, "utf8");
                await FS.writeFile(notesPath, content);
                await FS.unlink(notesBUPath);
                await wait(50);
            }
        }
        if (existsSync(dirBUPath)) {
            const nextScriptStarted = existsSync(Path.join(dir, `notes-BU${dirID + 1}`));
            if (!nextScriptStarted) {
                await FS.rmdir(noteFilesDir, {recursive: true});
                await wait(50);
                await FS.rename(dirBUPath, noteFilesDir);
                await wait(50);
            }
        }
    };
}

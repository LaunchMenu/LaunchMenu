import {File, FileAutoReloader, FileAutoSaver, IFile} from "@launchmenu/core";
import {DataCacher, IDataHook, IDataRetriever} from "model-react";
import {NoteCategory} from "./NoteCategory";
import {INoteMetadata} from "./_types/INoteMetadata";

export class Note {
    public readonly ID: string;

    protected dataSource: IDataRetriever<INoteMetadata>;
    protected update: (ID: string, data?: INoteMetadata) => void;

    protected categoriesSource: (hook?: IDataHook) => NoteCategory[];

    // Manage the note file
    protected file = new DataCacher<
        | {
              file: File;
              fileSaver: FileAutoSaver;
              fileReloader: FileAutoReloader;
          }
        | undefined
    >((h, prev) => {
        const filePath = this.dataSource(h).location;

        if (prev) {
            // If the path hasn't changed, use the previous items
            if (prev.file.getPath() == filePath) return prev;

            // IF it has changed, destroy the previous items
            prev.fileSaver.destroy();
            prev.fileReloader.destroy();
        }

        try {
            const file = new File(filePath);
            console.log(file);
            return {
                file,
                fileSaver: new FileAutoSaver(file),
                fileReloader: new FileAutoReloader(file),
            };
        } catch (e) {
            console.error(e);
            return undefined;
        }
    });

    /**
     * Creates a new note instance
     * @param ID The ID of the note
     * @param dataSource The data source of the note
     * @param update A function to update the note's data
     * @param categoriesSource All categories in the system, including ones not assigned to this note
     */
    public constructor(
        ID: string,
        dataSource: IDataRetriever<INoteMetadata>,
        update: (ID: string, data?: INoteMetadata) => void,
        categoriesSource: IDataRetriever<NoteCategory[]> = () => []
    ) {
        this.ID = ID;
        this.dataSource = dataSource;
        this.update = update;
        this.categoriesSource = categoriesSource;
    }

    /**
     * Properly disposes this note
     */
    public destroy(): void {
        const file = this.file.get();
        if (!file) return;
        const {fileSaver, fileReloader} = file;
        fileSaver.destroy();
        fileReloader.destroy();
    }

    // Getters
    /**
     * Retrieves the name of the note
     * @param hook The hook to subscribe to changes
     * @returns The note's name
     */
    public getName(hook?: IDataHook): string {
        return this.dataSource(hook).name;
    }

    /** The cached category */
    protected category = new DataCacher(h => {
        const ID = this.dataSource(h).categoryID;
        return this.categoriesSource(h).find(({ID: vID}) => vID == ID);
    });

    /**
     * Retrieves the note's category
     * @param hook The hook to subscribe to changes
     * @returns The note's category
     */
    public getCategory(hook?: IDataHook): NoteCategory | undefined {
        return this.category.get(hook);
    }

    /**
     * Retrieves the path of the note's file
     * @param hook The hook to subscribe to changes
     * @returns The note's file path
     */
    public getFilePath(hook?: IDataHook): string {
        return this.dataSource(hook).location;
    }

    /**
     * Retrieves the text of the note
     * @param hook The hook to subscribe to changes
     * @returns The note's contents
     */
    public getText(hook?: IDataHook): string {
        return this.file.get(hook)?.file.get(hook) ?? "";
    }

    /**
     * Retrieves the last update time
     * @param hook The hook to subscribe to changes
     * @returns The timestamp of the last update
     */
    public getModifiedAt(hook?: IDataHook): number {
        return this.dataSource(hook).modifiedAt;
    }

    /**
     * Retrieves all the notes metadata at once
     * @param hook The hook to subscribe to changes
     * @returns The notes metadata
     */
    public getData(hook?: IDataHook): INoteMetadata {
        return this.dataSource(hook);
    }

    // Setters
    /**
     * Updates the note's name
     * @param name The new name of the node
     */
    public setName(name: string): void {
        this.update(this.ID, {...this.dataSource(), name});
    }

    /**
     * Updates the note's category
     * @param category The new category of the note
     */
    public setCategory(category: NoteCategory | undefined | null): void {
        this.setCategoryID(category?.ID);
    }

    /**
     * Updates the note category's ID
     * @param categoryID The new category ID of the note
     */
    public setCategoryID(categoryID: string | undefined | null): void {
        this.update(this.ID, {...this.dataSource(), categoryID: categoryID ?? undefined});
    }

    /**
     * Sets the file path
     * @param path The path to the note's file
     */
    public setFilePath(path: string): void {
        this.update(this.ID, {...this.dataSource(), location: path});
    }

    /**
     * Sets the text of the note's file
     * @param text The text to be set
     */
    public setText(text: string): void {
        this.file.get()?.file.set(text);
        this.setModifiedAt(Date.now());
    }

    /**
     * Sets the last update time
     * @param time The time to set
     */
    public setModifiedAt(time: number): void {
        this.update(this.ID, {...this.dataSource(), modifiedAt: time});
    }

    /**
     * Deletes the note
     */
    public delete(): void {
        this.update(this.ID);
    }
}

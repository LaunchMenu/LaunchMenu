import {File, FileAutoReloader, FileAutoSaver} from "@launchmenu/core";
import {DataCacher, IDataHook, IDataRetriever} from "model-react";
import {NoteCategory} from "./NoteCategory";
import {NotesSource} from "./NotesSource";
import {INoteMetadata} from "./_types/INoteMetadata";
import {IInherit} from "./_types/IInherit";
import {ifNotInherited} from "./tools/ifNotInherited";
import {IHighlightLanguage} from "./_types/IHighlightLanguage";

export class Note {
    public readonly ID: string;

    protected dataSource: IDataRetriever<INoteMetadata>;
    protected update: (ID: string, data?: INoteMetadata) => void;

    protected notesSource: NotesSource;

    // Manage the note file
    protected file = new DataCacher< {
              file: File;
              fileSaver: FileAutoSaver;
              fileReloader: FileAutoReloader;
          }
        | undefined    >((h, prev) => {
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
        notesSource: NotesSource
    ) {
        this.ID = ID;
        this.dataSource = dataSource;
        this.update = update;
        this.notesSource = notesSource;
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

    /**
     * Retrieves the notes source that this note belongs to
     * @returns The notes source
     */
    public getSource(): NotesSource {
        return this.notesSource;
    }

    /** The cached category */
    protected category = new DataCacher(h => {
        const ID = this.dataSource(h).categoryID;
        return this.notesSource.getAllCategories(h).find(({ID: vID}) => vID == ID);
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

    // All appearance getters
    /**
     * Retrieves the color of this note
     * @param hook The hook to subscribe to changes
     * @returns The color of the note
     */
    public getColor(hook?: IDataHook): string {
        return (
            ifNotInherited(this.dataSource(hook).color) ??
            this.getCategory(hook)?.getColor(hook) ??
            this.notesSource.defaults.color(hook)
        );
    }

    /**
     * Retrieves the font size for the note
     * @param hook The hook to subscribe to changes
     * @returns The font size of the note
     */
    public getFontSize(hook?: IDataHook): number {
        return (
            ifNotInherited(this.dataSource(hook).fontSize) ??
            this.getCategory(hook)?.getFontSize(hook) ??
            this.notesSource.defaults.fontSize(hook)
        );
    }

    /**
     * Retrieves the syntax mode for the note
     * @param hook The hook to subscribe to changes
     * @returns The syntax mode of the note
     */
    public getSyntaxMode(hook?: IDataHook): IHighlightLanguage {
        return (
            ifNotInherited(this.dataSource(hook).syntaxMode) ??
            this.getCategory(hook)?.getSyntaxMode(hook) ??
            this.notesSource.defaults.syntaxMode(hook)
        );
    }

    /**
     * Retrieves the value of whether to show rich content
     * @param hook The hook to subscribe to changes
     * @returns Whether to show rich content
     */
    public getShowRichContent(hook?: IDataHook): boolean {
        return (
            ifNotInherited(this.dataSource(hook).showRichContent) ??
            this.getCategory(hook)?.getShowRichContent(hook) ??
            this.notesSource.defaults.showRichContent(hook)
        );
    }

    /**
     * Retrieves the default value of whether to search the content for notes in this category
     * @param hook The hook to subscribe to changes
     * @returns Whether to search content
     */
    public getSearchContent(hook?: IDataHook): boolean {
        return (
            ifNotInherited(this.dataSource(hook).searchContent) ??
            this.getCategory(hook)?.getSearchContent(hook) ??
            this.notesSource.defaults.searchContent(hook)
        );
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

    // All appearance setters
    /**
     * Sets the color of the note
     * @param color The new color of the note
     */
    public setColor(color: string | IInherit): void {
        this.update(this.ID, {...this.dataSource(), color});
    }

    /**
     * Sets the font size of the note
     * @param fontSize The new font size of the category
     */
    public setFontSize(fontSize: number | IInherit): void {
        this.update(this.ID, {...this.dataSource(), fontSize});
    }

    /**
     * Sets the syntax mode of the note
     * @param mode The new syntax mode of the note
     */
    public setSyntaxMode(mode: IHighlightLanguage | IInherit): void {
        this.update(this.ID, {...this.dataSource(), syntaxMode: mode});
    }

    /**
     * Sets whether to show rich content of the note
     * @param showRichContent Whether to show rich content
     */
    public setShowRichContent(showRichContent: boolean | IInherit): void {
        this.update(this.ID, {...this.dataSource(), showRichContent});
    }

    /**
     * Sets the default for whether to search content for notes in this category
     * @param searchContent Whether to search content for this category
     */
    public setSearchContent(searchContent: boolean | IInherit): void {
        this.update(this.ID, {...this.dataSource(), searchContent});
    }
}

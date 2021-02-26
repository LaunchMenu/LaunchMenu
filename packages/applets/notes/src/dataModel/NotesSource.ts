import {FieldsFile, FileAutoReloader, FileAutoSaver, IField} from "@launchmenu/core";
import {DataCacher, Field, IDataHook, waitFor} from "model-react";
import {Note} from "./Note";
import {NoteCategory} from "./NoteCategory";
import {INoteCategoryMetadata} from "./_types/INoteCategoryMetadata";
import {INoteMetadata} from "./_types/INoteMetadata";
import {v4 as uuid} from "uuid";
import Path from "path";
import {IDefaultAppearanceRetrievers} from "./_types/IDefaultAppearanceRetrievers";

type INotesFile = FieldsFile<{
    /** The notes categories */
    categories: IField<INoteCategoryMetadata[]>;
    /** The data for the notes themselves */
    notes: IField<INoteMetadata[]>;
}>;

export class NotesSource {
    // The data source
    protected file: INotesFile;
    protected loader: FileAutoReloader;
    protected saver: FileAutoSaver;

    protected notesDir: string;

    /** The default appearance */
    public defaults: IDefaultAppearanceRetrievers;

    /**
     * Creates a new notes data source based on the specified file path
     * @param metadataFilePath The path to the metadata file of the notes
     * @param defaults The retrievers of the defaults of the notes
     **/
    public constructor(metadataFilePath: string, defaults: IDefaultAppearanceRetrievers) {
        this.file = new FieldsFile({
            path: metadataFilePath,
            fields: {categories: new Field([]), notes: new Field([])},
        });
        this.file.load();
        this.loader = new FileAutoReloader(this.file);
        this.saver = new FileAutoSaver(this.file);

        this.notesDir = Path.join(metadataFilePath, "..", "notes");

        this.defaults = defaults;
    }

    /**
     * Retrieves the path of this source
     * @returns The path of notes source
     */
    public getPath(): string {
        return this.file.getPath();
    }

    /**
     * Retrieves the notes file that the data is stored in
     * @returns The metadata file that all notes are stored in
     */
    public getFile(): INotesFile {
        return this.file;
    }

    /**
     * Retrieves the path to the directory notes are stored in
     * @returns The notes storage directory
     */
    public getNotesDir(): string {
        return this.notesDir;
    }

    /**
     * Disposes this source fully
     */
    public destroy() {
        this.loader.destroy();
        this.saver.destroy();
        this.notes.get().forEach(note => note.destroy());
    }

    // The notes themselves
    /** The notes data retriever that synchronizes with the note data on disk */
    protected notes = new DataCacher<Note[]>((h, prevNotes = []) => {
        const notesData = this.file.fields.notes.get(h);

        // Deleted any removed notes
        prevNotes.forEach(note => {
            const stillExists = notesData.find(({ID}) => note.ID == ID);
            if (!stillExists) note.destroy();
        });

        // Add any new notes (or obtain the corresponding existing note)
        return notesData.map(noteData => {
            // Check if a note instance already exists for this data
            const prevNote = prevNotes.find(note => note.ID == noteData.ID);
            if (prevNote) return prevNote;

            // If it doesn't exist, create it with some data retriever and updater functions
            const dataSource = new DataCacher<INoteMetadata>(
                h =>
                    this.file.fields.notes.get(h).find(({ID}) => ID == noteData.ID) ?? {
                        ...noteData,
                        name: "Deleted",
                    }
            );
            return new Note(
                noteData.ID,
                h => dataSource.get(h),
                (ID, data) => this.updateNote(ID, data),
                this
            );
        });
    });

    /**
     * Updates the metadata of a given note
     * @param ID The note's ID
     * @param data The new data for the note (includes ID of the note)
     */
    protected updateNote(ID: string, data?: INoteMetadata): void {
        const notes = this.file.fields.notes.get();
        const noteIndex = notes.findIndex(({ID: vID}) => vID == ID);
        if (noteIndex != -1) {
            const newNotes = [
                ...notes.slice(0, noteIndex),
                ...(data ? [data] : []),
                ...notes.slice(noteIndex + 1),
            ].sort(({modifiedAt: a}, {modifiedAt: b}) => b - a);
            this.file.fields.notes.set(newNotes);
        }
    }

    /**
     * Retrieves all the registered notes
     * @param hook The hook to subscribe to changes
     * @returns The notes that are registered
     */
    public getAllNotes(hook?: IDataHook): Note[] {
        return this.notes.get(hook);
    }

    // The note categories data
    /** The categories data retriever that synchronizes with the note data on disk */
    protected categories = new DataCacher<NoteCategory[]>((h, prevCategories = []) => {
        const categoriesData = this.file.fields.categories.get(h);

        return categoriesData.map(categoryData => {
            // Check if a note instance already exists for this data
            const prevCategory = prevCategories.find(note => note.ID == categoryData.ID);
            if (prevCategory) return prevCategory;

            // If it doesn't exist, create it with some data retriever and updater functions
            const dataSource = new DataCacher<INoteCategoryMetadata>(
                h =>
                    this.file.fields.categories
                        .get(h)
                        .find(({ID}) => ID == categoryData.ID) ?? {
                        ...categoryData,
                        name: "Deleted",
                    }
            );
            return new NoteCategory(
                categoryData.ID,
                h => dataSource.get(h),
                (ID, data) => this.updateCategory(ID, data),
                this
            );
        });
    });

    /**
     * Updates the metadata of a given category
     * @param ID The ID of the category to update
     * @param data The new data for the category (includes ID of the note)
     */
    protected updateCategory(ID: string, data?: INoteCategoryMetadata): void {
        const categories = this.file.fields.categories.get();
        const categoryIndex = categories.findIndex(({ID: vID}) => vID == ID);
        if (categoryIndex != -1) {
            const newCategories = [
                ...categories.slice(0, categoryIndex),
                ...(data ? [data] : []),
                ...categories.slice(categoryIndex + 1),
            ];
            this.file.fields.categories.set(newCategories);
        }
    }

    /**
     * Retrieves all the note categories
     * @param hook The hook to subscribe to changes
     * @returns The note categories
     */
    public getAllCategories(hook?: IDataHook): NoteCategory[] {
        return this.categories.get(hook);
    }

    /**
     * Retrieves the category with a specified ID
     * @param ID The ID of the category
     * @param hook The hook to subscribes to changes
     * @returns The category if it exists
     */
    public getCategoryByID(ID: string, hook?: IDataHook): NoteCategory | null {
        return this.categories.get(hook).find(({ID: cID}) => cID == ID) ?? null;
    }

    // File/category creation
    /**
     * Adds a new note to the system
     * @param name The name of the note, ID will be based on this if specified
     * @param ID The ID of the note
     * @returns The created note
     */
    public async addNote(name?: string, ID?: string): Promise<Note> {
        // Create the note's ID
        const baseID = name ?? uuid();
        if (!ID) ID = baseID;

        // Create the note
        return this.createNote({
            ID,
            name: name ?? "Note",
            modifiedAt: Date.now(),
            location: Path.join(this.notesDir, `${ID}.txt`),
            color: "inherit",
            fontSize: "inherit",
            showRichContent: "inherit",
            syntaxMode: "inherit",
            searchContent: "inherit",
        });
    }

    /**
     * Adds a note to the system, for which a file already exists
     * @param location The location of the note document
     * @param name The name of the note to import
     * @returns The imported note
     */
    public async importNote(location: string, name?: string): Promise<Note> {
        // Create the note's ID
        const fileNameWithExtension = location.substring(
            Path.dirname(location).length + 1
        );
        const fileName = fileNameWithExtension.substring(
            0,
            fileNameWithExtension.length - Path.extname(fileNameWithExtension).length
        );
        const ID = name ?? fileName;

        // Create the note
        return this.createNote({
            name: name ?? fileName,
            modifiedAt: Date.now(),
            location,
            ID,
            color: "inherit",
            fontSize: "inherit",
            showRichContent: "inherit",
            syntaxMode: "inherit",
            searchContent: "inherit",
        });
    }

    /**
     * Creates a new note with the given information
     * @param noteData The note data
     * @returns The created note
     */
    public async createNote(noteData: INoteMetadata): Promise<Note> {
        // Make sure the ID is unique
        const baseID = noteData.ID;
        let ID = baseID;
        let suffix = 0;
        while (this.notes.get().some(({ID: vID}) => vID == ID)) ID = baseID + ++suffix;
        noteData = {...noteData, ID};

        // Insert the data
        this.file.fields.notes.set([...this.file.fields.notes.get(), noteData]);

        // Retrieve the note
        let note: Note | undefined;
        await waitFor(h => {
            note = this.notes.get(h).find(({ID}) => noteData.ID == ID);
            return !!note;
        });
        return note as Note;
    }

    // Note category creation
    /**
     * Adds a new note category to the system
     * @param name The name of the category, ID will be based on this if specified
     * @param ID The ID of the note category
     * @returns The created note category
     */
    public async addNoteCategory(name?: string, ID?: string): Promise<NoteCategory> {
        // Create the note category's ID
        const baseID = name ?? uuid();
        if (!ID) ID = baseID;

        // Create the note
        return this.createNoteCategory({
            ID,
            name: name ?? "Note",
            color: "inherit",
            fontSize: "inherit",
            showRichContent: "inherit",
            syntaxMode: "inherit",
            searchContent: "inherit",
        });
    }

    /**
     * Creates a new note category with the given information
     * @param noteCategoryData The note category data
     * @returns The created note category
     */
    public async createNoteCategory(
        noteCategoryData: INoteCategoryMetadata
    ): Promise<NoteCategory> {
        // Make sure the ID is unique
        const baseID = noteCategoryData.ID;
        let ID = baseID;
        let suffix = 0;
        while (this.notes.get().some(({ID: vID}) => vID == ID)) ID = baseID + ++suffix;
        noteCategoryData = {...noteCategoryData, ID};

        // Insert the data
        this.file.fields.categories.set([
            ...this.file.fields.categories.get(),
            noteCategoryData,
        ]);

        // Retrieve the note
        let noteCategory: NoteCategory | undefined;
        await waitFor(h => {
            noteCategory = this.categories
                .get(h)
                .find(({ID}) => noteCategoryData.ID == ID);
            return !!noteCategory;
        });
        return noteCategory as NoteCategory;
    }
}

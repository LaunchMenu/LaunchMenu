import {DataCacher, IDataHook, IDataRetriever} from "model-react";
import {Note} from "./Note";
import {INoteCategoryMetadata} from "./_types/INoteCategoryMetadata";

export class NoteCategory {
    public readonly ID: string;

    protected notesSource: (hook?: IDataHook) => Note[];

    protected dataSource: IDataRetriever<INoteCategoryMetadata>;
    protected update: (ID: string, data?: INoteCategoryMetadata) => void;

    /**
     * Creates a new note category instance
     * @param ID The ID of the note
     * @param dataSource The data source of the note category
     * @param update A function to update the category's data
     * @param notesSource All registered notes, including ones not part of this category
     */
    public constructor(
        ID: string,
        dataSource: IDataRetriever<INoteCategoryMetadata>,
        update: (ID: string, data?: INoteCategoryMetadata) => void,
        notesSource: IDataRetriever<Note[]> = () => []
    ) {
        this.ID = ID;
        this.dataSource = dataSource;
        this.update = update;
        this.notesSource = notesSource;
    }

    // Getters
    /**
     * Retrieves the name of the category
     * @param hook The hook to subscribe to changes
     * @returns The category's name
     */
    public getName(hook?: IDataHook): string {
        return this.dataSource(hook).name;
    }

    /**
     * Retrieves the color of the category
     * @param hook The hook to subscribe to changes
     * @returns The category's color
     */
    public getColor(hook?: IDataHook): string {
        return this.dataSource(hook).color;
    }

    /** The cached notes of this category */
    protected notes = new DataCacher(h =>
        this.notesSource(h).filter(note => note.getCategory(h)?.ID == this.ID)
    );

    /**
     * Retrieves all notes in this category
     * @param hook The hook to subscribe to changes
     * @returns The notes in the category
     */
    public getNotes(hook?: IDataHook): Note[] {
        return this.notes.get(hook);
    }

    // Setters
    /**
     * Updates the category's name
     * @param name The new name of the category
     */
    public setName(name: string): void {
        return this.update(this.ID, {...this.dataSource(), name});
    }

    /**
     * Updates the note's category's id
     * @param color The new color of the category
     */
    public setColor(color: string): void {
        return this.update(this.ID, {...this.dataSource(), color});
    }

    /**
     * Adds a note to this category
     * @param note The note to be added
     */
    public addNote(note: Note): void {
        note.setCategory(this);
    }

    /**
     * Deletes the category
     */
    public delete(): void {
        return this.update(this.ID);
    }
}

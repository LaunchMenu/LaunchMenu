import {ISimpleSearchPatternMatcher} from "@launchmenu/core";
import {DataCacher, IDataHook, IDataRetriever} from "model-react";
import {createCustomSearchPatternMatcher} from "./tools/createCustomSearchPatternMatcher";
import {ifNotInherited} from "./tools/ifNotInherited";
import {Note} from "./Note";
import {NotesSource} from "./NotesSource";
import {IHighlightLanguage} from "./_types/IHighlightLanguage";
import {IInherit} from "./_types/IInherit";
import {INoteCategoryMetadata} from "./_types/INoteCategoryMetadata";

export class NoteCategory {
    public readonly ID: string;

    protected notesSource: NotesSource;

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
        notesSource: NotesSource
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
     * Retrieves the notes source that this category belongs to
     * @returns The notes source
     */
    public getSource(): NotesSource {
        return this.notesSource;
    }

    /** The cached notes of this category */
    protected notes = new DataCacher(h =>
        this.notesSource.getAllNotes(h).filter(note => note.getCategory(h)?.ID == this.ID)
    );

    /**
     * Retrieves all notes in this category
     * @param hook The hook to subscribe to changes
     * @returns The notes in the category
     */
    public getNotes(hook?: IDataHook): Note[] {
        return this.notes.get(hook);
    }

    /**
     * Retrieves the search pattern as a text string
     * @param hook The hook to subscribe to changes
     * @returns The search pattern if any
     */
    public getSearchPattern(hook?: IDataHook): string | undefined {
        return this.dataSource(hook).searchPattern || undefined;
    }

    /** The search pattern matcher */
    protected searchPatternMatcher = createCustomSearchPatternMatcher(
        hook => this.getSearchPattern(hook),
        h => this.getName(h)
    );

    /**
     * Retrieves the search pattern matcher for this category
     * @returns The search pattern matcher if any
     *
     * @remarks The matcher is never replaced, it only changes internally, so there is no need to subscribe to changes
     */
    public getSearchPatternMatcher(): ISimpleSearchPatternMatcher {
        return this.searchPatternMatcher;
    }

    /**
     * Retrieves the data of this category
     * @param hook The hook to subscribe to changes
     * @returns All the data of the category
     */
    public getData(hook?: IDataHook): INoteCategoryMetadata {
        return this.dataSource(hook);
    }

    // All appearance getters
    /**
     * Retrieves the default color for notes in this category
     * @param hook The hook to subscribe to changes
     * @returns The color of the note
     */
    public getColor(hook?: IDataHook): string {
        return (
            ifNotInherited(this.dataSource(hook).color) ??
            this.notesSource.defaults.color(hook)
        );
    }

    /**
     * Retrieves the default font size for notes in this category
     * @param hook The hook to subscribe to changes
     * @returns The font size of the note
     */
    public getFontSize(hook?: IDataHook): number {
        return (
            ifNotInherited(this.dataSource(hook).fontSize) ??
            this.notesSource.defaults.fontSize(hook)
        );
    }

    /**
     * Retrieves the default syntax mode for notes in this category
     * @param hook The hook to subscribe to changes
     * @returns The syntax mode of the note
     */
    public getSyntaxMode(hook?: IDataHook): IHighlightLanguage {
        return (
            ifNotInherited(this.dataSource(hook).syntaxMode) ??
            this.notesSource.defaults.syntaxMode(hook)
        );
    }

    /**
     * Retrieves the default value of whether to show rich content for notes in this category
     * @param hook The hook to subscribe to changes
     * @returns Whether to show rich content
     */
    public getShowRichContent(hook?: IDataHook): boolean {
        return (
            ifNotInherited(this.dataSource(hook).showRichContent) ??
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
            this.notesSource.defaults.searchContent(hook)
        );
    }

    // Setters
    /**
     * Updates the category's name
     * @param name The new name of the category
     */
    public setName(name: string): void {
        this.update(this.ID, {...this.dataSource(), name});
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
        this.update(this.ID);
    }

    /**
     * Sets the search pattern as a text string
     * @param pattern The search pattern for this category
     * @returns The search pattern if any
     */
    public setSearchPattern(pattern: string | undefined): void {
        this.update(this.ID, {...this.dataSource(), searchPattern: pattern});
    }

    // All appearance setters
    /**
     * Sets the default color for notes in this category
     * @param color The new color of the category
     */
    public setColor(color: string | IInherit): void {
        this.update(this.ID, {...this.dataSource(), color});
    }

    /**
     * Sets the default font size for notes in this category
     * @param fontSize The new font size of the category
     */
    public setFontSize(fontSize: number | IInherit): void {
        this.update(this.ID, {...this.dataSource(), fontSize});
    }

    /**
     * Sets the default syntax mode for notes in this category
     * @param mode The new syntax mode of the category
     */
    public setSyntaxMode(mode: IHighlightLanguage | IInherit): void {
        this.update(this.ID, {...this.dataSource(), syntaxMode: mode});
    }

    /**
     * Sets the default for whether to show rich content for notes in this category
     * @param showRichContent Whether to show rich content for this category
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

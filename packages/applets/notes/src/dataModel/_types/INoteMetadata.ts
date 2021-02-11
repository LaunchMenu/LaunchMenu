export type INoteMetadata = {
    /** The unique id of the note */
    ID: string;
    /** The name of the note */
    name: string;
    /** The location of the note in the file system */
    location: string;
    /** The last time that */
    modifiedAt: number;
    /** The id of the category this note is in */
    categoryID?: string;
};

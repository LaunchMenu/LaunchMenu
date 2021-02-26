import {IInherit} from "./IInherit";
import {INoteAppearanceMetadata} from "./INoteAppearanceMetadata";

export type INoteMetadata = {
    /** The unique id of the note */
    ID: string;
    /** The name of the note */
    name: string;
    /** The location of the note in the file system */
    location: string;
    /** The last time at which the note was modified */
    modifiedAt: number;
    /** The id of the category this note is in */
    categoryID?: string;
} & Partial<INoteAppearanceMetadata<IInherit>>;

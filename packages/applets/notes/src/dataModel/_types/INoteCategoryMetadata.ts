import {IInherit} from "./IInherit";
import {INoteAppearanceMetadata} from "./INoteAppearanceMetadata";

export type INoteCategoryMetadata = {
    /** The id of this category */
    ID: string;
    /** The name of the category */
    name: string;
} & INoteAppearanceMetadata<IInherit>;

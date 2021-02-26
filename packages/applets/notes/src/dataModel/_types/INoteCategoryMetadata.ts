import {IInherit} from "./IInherit";
import {INoteAppearanceMetadata} from "./INoteAppearanceMetadata";

export type INoteCategoryMetadata = {
    /** The id of this category */
    ID: string;
    /** The name of the category */
    name: string;
    /** The search pattern of this category */
    searchPattern?: string;
} & Partial<INoteAppearanceMetadata<IInherit>>;

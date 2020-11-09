import {ICategory} from "../../types/category/_types/ICategory";

/**
 * A category type to specify the number of items that have the action binding in this category
 */
export type IContextCategory = ICategory & {
    /** The number of items in this context category */
    count: number;
};

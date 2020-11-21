/**
 * The data on which an item can be graded for a search
 */
export type ISimpleSearchGradeFields = {
    /** The item's name */
    name?: string;
    /** The item's description */
    description?: string;
    /** The item's content text */
    content?: string;
    /** The item's tags */
    tags?: string[];
};

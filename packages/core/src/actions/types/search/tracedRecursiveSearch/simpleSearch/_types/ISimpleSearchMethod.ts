import {IMenuItem} from "../../../../../../menus/items/_types/IMenuItem";
import {IPriority} from "../../../../../../menus/menu/priority/_types/IPriority";
import {IQuery} from "../../../../../../menus/menu/_types/IQuery";
import {ISimpleSearchGradeFields} from "./ISimpleSearchGradeFields";
import {ISimpleSearchExecutor} from "./ISimpleSearchExecutor";
import {IDataHook} from "model-react";
import {IUUID} from "../../../../../../_types/IUUID";
import {ISearchHighlighter} from "../../../_types/ISearchHighlighter";

/**
 * A search executor, such that different search methods can be chosen for the simple search handler
 */
export type ISimpleSearchMethod = {
    /** The name of this search method */
    name: string;
    /** A consistent and unique ID for this method (should be consistent across launches) */
    ID: IUUID;
    /** The way to represent the search executor in the settings */
    view: IMenuItem;
    /** A function to grade the item's search data */
    rate?: {
        /**
         * Retrieves the priority for the given data
         * @param data The data to be rated
         * @param search The search text to be used for grading
         * @param query The original query (text may still contain patterns that shouldn't be used for grading)
         * @param hook The data hook to subscribe to changes
         * @returns The found priority
         */
        (
            data: ISimpleSearchGradeFields,
            search: string,
            query: IQuery,
            hook: IDataHook
        ): IPriority;
    };
    /** A function to completely override the default search behavior */
    getSearchable?: ISimpleSearchExecutor;
    /** Highlights a given piece of text with this method */
    highlight?: ISearchHighlighter;
};

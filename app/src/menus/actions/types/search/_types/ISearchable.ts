import {IMenuItemCallback} from "../../../../menu/_types/IMenuItemCallback";
import {IQuery} from "../../../../menu/_types/IQuery";

/**
 * Data that can be searchable
 */
export type ISearchable = {
    /**
     * Searches for items within this tree, that matches the search query
     * @param query The text to search for
     * @param callback The callback to asynchronously return items to, the returned promise should ba awaited
     * @returns A promise that resolves once this item completed querying
     */
    search: (query: IQuery, callback: IMenuItemCallback<IQuery>) => Promise<void>;
};

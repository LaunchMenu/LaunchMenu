import {Action} from "../../Action";
import {ISearchable} from "./_types/ISearchable";

/**
 * The action to search for items within the given items
 */
export const searchAction = new Action((searchers: ISearchable[]) => {
    return {
        search: async (query, callback) => {
            for (const searcher of searchers) {
                await searcher.search(query, callback);
            }
        },
    } as ISearchable;
});

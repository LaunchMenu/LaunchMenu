import {Action} from "../../Action";
import {IMenuSearchable} from "./_types/IMenuSearchable";

/**
 * The action to search for items within the given items
 */
export const searchAction = new Action((searchers: IMenuSearchable[][]) => {
    return searchers.flat();
}, []);

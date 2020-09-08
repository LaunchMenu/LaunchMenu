import {IDataHook} from "model-react";
import {IMenuItem} from "../../../../../items/_types/IMenuItem";

/**
 * Data for simple item searches
 */
export type ISimpleSearchData = {
    /** The name of the item */
    name?: string | ((hook: IDataHook) => string);
    /** The description of the item */
    description?: string | ((hook: IDataHook) => string);
    /** The tags of the item */
    tags?: string[] | ((hook: IDataHook) => string[]);
    /** Any number of children that can be matched */
    children?: IMenuItem[];

    /** Consistent identifiers for the items with this data */
    ids: (string | number)[];
};

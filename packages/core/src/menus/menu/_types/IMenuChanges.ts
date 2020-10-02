import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * The item changes that can be made to a menu
 */
export type IMenuChanges = {
    filter?: (item: IMenuItem, category: ICategory | undefined) => boolean;
    addBefore?: IMenuItem[];
    addAfter?: IMenuItem[];
};

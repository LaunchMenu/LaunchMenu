import {IPrioritizedMenuItem} from "../../../../menus/menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {ISearchable} from "../../../../utils/searchExecuter/_types/ISearchable";

/**
 * A searchable object that returns menu item results
 */
export type IMenuSearchable = ISearchable<IQuery, IPrioritizedMenuItem>;

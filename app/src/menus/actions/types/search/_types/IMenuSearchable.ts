import {ISearchable} from "../../../../../utils/searchExecuter/_types/ISearchable";
import {IPrioritizedMenuItem} from "../../../../menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../../../menu/_types/IQuery";

/**
 * A searchable object that returns menu item results
 */
export type IMenuSearchable = ISearchable<IQuery, IPrioritizedMenuItem>;

import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {ISearchable} from "./ISearchable";

/** A recursive search for menu items */
export type IMenuSearchable = ISearchable<IQuery, IMenuItem>;

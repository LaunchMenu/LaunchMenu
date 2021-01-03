import {IDataHook} from "model-react";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {IQuery} from "../../../../../menus/menu/_types/IQuery";

/**
 * The children input data that can be passed for a recursive menu item search
 */
export type IRecursiveSearchChildren =
    | IMenuItem[]
    | ((query: IQuery, hook: IDataHook) => IMenuItem[]);

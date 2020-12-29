import {IDataHook} from "model-react";
import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {IPatternMatch} from "../../../../utils/searchExecuter/_types/IPatternMatch";

/**
 * A pattern matcher that can be passed with the simple search data
 */
export type ISimpleSearchPatternMatcher = (
    search: IQuery,
    hook: IDataHook
) => IPatternMatch | undefined;

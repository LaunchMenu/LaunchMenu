import {IDataHook} from "model-react";
import {IPatternMatch} from "../../../../../../utils/searchExecuter/_types/IPatternMatch";
import {ISubscribable} from "../../../../../../utils/subscribables/_types/ISubscribable";
import {IUUID} from "../../../../../../_types/IUUID";
import {IMenuItem} from "../../../../../items/_types/IMenuItem";
import {IQuery} from "../../../../../menu/_types/IQuery";

/**
 * Data for simple item searches
 */
export type ISimpleSearchData = {
    /** The name of the item */
    name?: ISubscribable<string | undefined>;
    /** The description of the item */
    description?: ISubscribable<string | undefined>;
    /** The tags of the item */
    tags?: ISubscribable<string[] | undefined>;
    /** Any number of children that can be matched */
    children?: ISubscribable<IMenuItem[]>;
    /** A possible pattern matcher to recognize search types */
    patternMatcher?: ISimpleSearchPatternMatcher;
    /** An identifier for the searchable */
    id: IUUID;
};

/**
 * A pattern matcher that can be passed with the simple search data
 */
export type ISimpleSearchPatternMatcher = (
    search: IQuery,
    hook: IDataHook
) => IPatternMatch | undefined;

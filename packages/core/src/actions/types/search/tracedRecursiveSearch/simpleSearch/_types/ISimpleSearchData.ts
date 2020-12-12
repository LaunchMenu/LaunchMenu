import {IDataHook} from "model-react";
import {IMenuItem} from "../../../../../../menus/items/_types/IMenuItem";
import {IQuery} from "../../../../../../menus/menu/_types/IQuery";
import {IPatternMatch} from "../../../../../../utils/searchExecuter/_types/IPatternMatch";
import {ISubscribable} from "../../../../../../utils/subscribables/_types/ISubscribable";
import {IUUID} from "../../../../../../_types/IUUID";
import {IShowChildInParent} from "../../_types/IShowChildInParent";

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
    /** Opens any required UI in order to show the specified child within its parent */
    showChild?: IShowChildInParent;
    /** The content text data (should be relatively small for efficiency) */
    content?: ISubscribable<string | undefined>;
    /** A possible pattern matcher to recognize search types */
    patternMatcher?: ISimpleSearchPatternMatcher;
    /** The ID of the menu item to show when matched, item can be attached using the identityAction */
    itemID: IUUID;
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

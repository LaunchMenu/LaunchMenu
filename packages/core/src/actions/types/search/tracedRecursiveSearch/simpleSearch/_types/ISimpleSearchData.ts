import {IDataHook} from "model-react";
import {IMenuItem} from "../../../../../../menus/items/_types/IMenuItem";
import {ISubscribable} from "../../../../../../utils/subscribables/_types/ISubscribable";
import {IUUID} from "../../../../../../_types/IUUID";
import {ISimpleSearchPatternMatcher} from "../../../_types/ISimpleSearchPatternMatcher";
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

import {ISearchHighlighterProps} from "../../../actions/types/search/_types/ISearchHighlighterProps";
import {ISimpleSearchPatternMatcher} from "../../../actions/types/search/_types/ISimpleSearchPatternMatcher";
import {IQuery} from "../../../menus/menu/_types/IQuery";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {LFC} from "../../../_types/LFC";

/** The props for the standard menu item name */
export type IMenuItemNameProps = {
    /** The textual string to show */
    name: ISubscribable<string>;
    /** The pattern matcher to use to extract the text to highlight from the query (E.g. removes prefix) */
    searchPattern?: ISimpleSearchPatternMatcher;
    /** The query to highlight in the description */
    query?: IQuery | null;
    /** The text highlighter to use for the highlighting, or null to not highlight, defaults to the simple highlighter */
    TextHighlighter?: LFC<ISearchHighlighterProps> | null;
};

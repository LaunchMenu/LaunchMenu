import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";
import {ISimpleSearchPatternMatcher} from "./ISimpleSearchPatternMatcher";

export type ISearchHighlighterProps = {
    /** The text to be highlighter */
    children: ISubscribable<string>;
    /** The query to use for highlighting */
    query?: IQuery | null;
    /** Any pattern to use to obtain the text (without pattern) from */
    pattern?: ISimpleSearchPatternMatcher;
};

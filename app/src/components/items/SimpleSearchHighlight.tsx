import React, {FC} from "react";
import {IQuery} from "../../menus/menu/_types/IQuery";
import {getSimpleSearchMatcher} from "../../menus/actions/types/search/simpleSearch/SimpleSearchMatcher";

/**
 * A component that uses the simple query matcher to highlight queries in the given text
 */
export const SimpleSearchHighlight: FC<{
    query: IQuery | null;
    children: string;
}> = ({query, children}) => {
    if (!query) return <>{children}</>;
    const matcher = getSimpleSearchMatcher(query);
    return matcher.highlight(children);
};

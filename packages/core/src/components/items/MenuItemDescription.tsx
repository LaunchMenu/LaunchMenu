import React, {Fragment} from "react";
import {simpleSearchHandler} from "../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {LFC} from "../../_types/LFC";
import {Truncated} from "../Truncated";
import {IMenuItemDescriptionProps} from "./_types/IMenuItemDescriptionProps";

/** The standard formatting for a menu item description  */
export const MenuItemDescription: LFC<IMenuItemDescriptionProps> = ({
    description,
    searchPattern,
    query,
    TextHighlighter = simpleSearchHandler.Highlighter,
}) => (
    <Fragment>
        <Truncated title={description}>
            {TextHighlighter ? (
                <TextHighlighter query={query} pattern={searchPattern}>
                    {description}
                </TextHighlighter>
            ) : (
                description
            )}
        </Truncated>
    </Fragment>
);

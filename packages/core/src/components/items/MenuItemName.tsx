import React from "react";
import {useDataHook} from "model-react";
import {simpleSearchHandler} from "../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {Box} from "../../styling/box/Box";
import {getHooked} from "../../utils/subscribables/getHooked";
import {LFC} from "../../_types/LFC";
import {IMenuItemNameProps} from "./_types/IMenuItemNameProps";

/** The standard formatting for a menu item name  */
export const MenuItemName: LFC<IMenuItemNameProps> = ({
    name,
    searchPattern,
    query,
    TextHighlighter = simpleSearchHandler.Highlighter,
}) => {
    const [h] = useDataHook();
    const nameV = getHooked(name, h);

    return (
        <Box font="header">
            {TextHighlighter ? (
                <TextHighlighter query={query} pattern={searchPattern}>
                    {nameV}
                </TextHighlighter>
            ) : (
                nameV
            )}
        </Box>
    );
};

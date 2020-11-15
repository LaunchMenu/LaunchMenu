import {createStandardMenuItem} from "../items/createStandardMenuItem";
import {adjustBindings} from "../items/adjustBindings";
import {isActionBindingFor} from "../../actions/utils/isActionBindingFor";
import {searchAction} from "../../actions/types/search/searchAction";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import React, {memo} from "react";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {Box} from "../../styling/box/Box";
import {useDataHook} from "model-react";
import {getHooked} from "../../utils/subscribables/getHooked";

/**
 * Creates a standard category
 * @param data The category data
 * @returns The category
 */
export function createStandardCategory({
    name,
    description,
}: {
    /** The name of the category */
    name: string;
    /** The description of the category */
    description?: string;
}): ICategory {
    return {
        name,
        description,
        item: {
            view: memo(({highlight, ...props}) => {
                return (
                    <MenuItemFrame {...props} transparent={true}>
                        <MenuItemLayout name={<Box font="header">{name}</Box>} />
                    </MenuItemFrame>
                );
            }),
            actionBindings: [],
        },
    };
}

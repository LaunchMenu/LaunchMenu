import {ICategory} from "../../actions/types/category/_types/ICategory";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import React, {memo} from "react";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {Box} from "../../styling/box/Box";

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

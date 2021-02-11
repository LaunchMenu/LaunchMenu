import React, {memo} from "react";
import {Box, ICategory, Loader, MenuItemFrame, MenuItemLayout} from "@launchmenu/core";
import {NoteCategory} from "../dataModel/NoteCategory";

/**
 * Creates a LM menu category for a given note category
 * @param category The note category to create the LM category for
 * @returns The LM category
 */
export function createNoteCategoryCategory(category: NoteCategory): ICategory {
    return {
        name: category.ID,
        item: {
            view: memo(({highlight, ...props}) => {
                return (
                    <MenuItemFrame {...props} transparent={true}>
                        <MenuItemLayout
                            name={
                                <Box font="header">
                                    <Loader>{h => category.getName(h)}</Loader>
                                </Box>
                            }
                        />
                    </MenuItemFrame>
                );
            }),
            actionBindings: [],
        },
    };
}

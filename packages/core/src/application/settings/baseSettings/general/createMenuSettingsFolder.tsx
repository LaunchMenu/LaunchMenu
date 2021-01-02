import {Loader} from "model-react";
import React from "react";
import {ICategory} from "../../../../actions/types/category/_types/ICategory";
import {createStandardCategory} from "../../../../menus/categories/createStandardCategory";
import {createStandardMenuItem} from "../../../../menus/items/createStandardMenuItem";
import {createFieldMenuItem} from "../../../../menus/items/inputs/createFieldMenuItem";
import {createBooleanSetting} from "../../../../settings/inputs/createBooleanSetting";
import {createNumberSetting} from "../../../../settings/inputs/createNumberSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";
import {settingPatternMatcher} from "../../../../settings/inputs/settingPatternMatcher";
import {selectExecuteHandler} from "../../../../uiLayers/types/select/selectExecuteHandler";
import {IViewStackItemView} from "../../../../uiLayers/_types/IViewStackItem";
import {constGetter} from "../../../../utils/constGetter";

/**
 * The categories used for the menu folder
 */
export const getMenuControlsFolderCategories = constGetter(() => ({
    cursor: createStandardCategory({name: "Cursor"}),
    categories: createStandardCategory({name: "Categories"}),
}));

/**
 * Creates a new settings folder with menu settings
 * @returns The created menu settings
 */
export function createMenuSettingsFolder() {
    return createSettingsFolder({
        name: "Menu",
        children: {
            // Categories
            maxSearchCategorySize: createNumberSetting({
                name: "Max search category size",
                init: 100,
                min: 5,
                content: (
                    <>
                        The maximum number of items to show per category when performing a
                        search
                    </>
                ),
                category: getMenuControlsFolderCategories().categories,
            }),
            maxCategorySize: createNumberSetting({
                name: "Max category size",
                init: 100,
                min: 5,
                content: <>The maximum number of items to show per category in menus</>,
                category: getMenuControlsFolderCategories().categories,
            }),
            categoryOrder: createCategorySortingSetting({
                name: "Category sort item",
                content: <>What item sorting the categories in the menu is based on</>,
                category: getMenuControlsFolderCategories().categories,
            }),
            showCategories: createBooleanSetting({
                name: "Show categories",
                init: true,
                content: <>Whether to show the category labels in the menu</>,
                category: getMenuControlsFolderCategories().categories,
            }),
            // Cursor
            scrollSpeed: createNumberSetting({
                name: "Cursor scroll speed",
                init: 70,
                min: 0,
                content: (
                    <>
                        The duration in milliseconds it takes to scroll to the newly
                        selected item.
                    </>
                ),
                category: getMenuControlsFolderCategories().cursor,
            }),
            scrollWrapSpeed: createNumberSetting({
                name: "Cursor wrap scroll speed",
                init: 200,
                min: 0,
                content: (
                    <>
                        The duration in milliseconds it takes to scroll to the newly
                        selected item, when switching between the first and last item of
                        the menu.
                    </>
                ),
                category: getMenuControlsFolderCategories().cursor,
            }),
            scrollPadding: createNumberSetting({
                name: "Cursor scroll margin",
                init: 50,
                min: 0,
                content: (
                    <>
                        The number of pixels that must be above and below the cursor.
                        Essentially determines at which point the menu decides to start
                        scrolling.
                    </>
                ),
                category: getMenuControlsFolderCategories().cursor,
            }),
        },
    });
}

/**
 * Creates a setting with choices for item sorting
 * @param data The config
 * @returns The created menu item and field
 */
export function createCategorySortingSetting({
    name,
    content,
    category,
}: {
    name: string;
    content?: IViewStackItemView;
    category?: ICategory;
}) {
    return createFieldMenuItem({
        init: "first" as "first" | "middle" | "last",
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h).toString()}</Loader>,
            actionBindings: [
                selectExecuteHandler.createBinding({
                    field,
                    undoable: true,
                    liveUpdate: false,
                    options: ["first", "middle", "last"],
                    createOptionView: v => createStandardMenuItem({name: v.toString()}),
                }),
            ],
            content,
            tags: h => ["field", field.get(h).toString()],
            resetable: true,
            resetUndoable: true,
            searchPattern: settingPatternMatcher,
            category,
        }),
    });
}

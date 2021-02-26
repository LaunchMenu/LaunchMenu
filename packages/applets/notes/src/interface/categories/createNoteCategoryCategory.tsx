import React from "react";
import {ICategory} from "@launchmenu/core";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {createColorableMenuItem} from "../createColorableMenuItem";
import {CategoryContent} from "./CategoryContent";
import {addNoteExecuteHandler} from "../actionHandlers/addNoteExecuteHandler";
import {IAddNoteCallback} from "../actionHandlers/_types/IAddNoteExecuteData";
import {setColorAction} from "../actionHandlers/noteAppearance/setColorAction";
import {setFontSizeAction} from "../actionHandlers/noteAppearance/setFontSizeAction";
import {setRichContentAction} from "../actionHandlers/noteAppearance/setRichContentAction";
import {setSearchContentAction} from "../actionHandlers/noteAppearance/setSearchContentAction";
import {setSyntaxModeAction} from "../actionHandlers/noteAppearance/setSyntaxModeAction";
import {setNoteCategoryNameExecuteHandler} from "./actionHandlers/setNoteCategoryNameExecuteHandler";
import {setSearchPatternAction} from "./actionHandlers/setSearchPatternAction";
import {setNoteCategoryNameAction} from "./actionHandlers/setNoteCategoryNameAction";
import {deleteNoteCategoryHandler} from "./actionHandlers/deleteNoteCategoryHandler";

/**
 * Creates a LM menu category for a given note category
 * @param category The note category to create the LM category for
 * @param onCreateInCategory A callback for when an item is created in this category
 * @returns The LM category
 */
export function createNoteCategoryCategory(
    category: NoteCategory,
    onCreateInCategory: IAddNoteCallback = () => Promise.resolve()
): ICategory {
    const menuCategory: ICategory = {
        name: category.ID,
        item: createColorableMenuItem({
            asCategory: () => menuCategory,
            content: <CategoryContent category={category} />,
            name: h => category.getName(h),
            color: h => category.getColor(h),
            actionBindings: [
                addNoteExecuteHandler.createBinding({
                    category,
                    notesSource: category.getSource(),
                    callback: onCreateInCategory,
                }),
                setNoteCategoryNameAction.createBinding(
                    setNoteCategoryNameExecuteHandler.createBinding(category)
                ),
                deleteNoteCategoryHandler.createBinding(category),
                setSearchPatternAction.createBinding({
                    set: pattern => category.setSearchPattern(pattern),
                    get: h => category.getSearchPattern(h) ?? "",
                }),
                setColorAction.createBinding({
                    set: color => category.setColor(color),
                    get: h => category.getColor(h),
                }),
                setSyntaxModeAction.createBinding({
                    set: syntax => category.setSyntaxMode(syntax),
                    get: h => category.getSyntaxMode(h),
                }),
                setFontSizeAction.createBinding({
                    set: size => category.setFontSize(size),
                    get: h => category.getFontSize(h),
                }),
                setRichContentAction.createBinding({
                    set: richContent => category.setShowRichContent(richContent),
                    get: h => category.getShowRichContent(h),
                }),
                setSearchContentAction.createBinding({
                    set: searchContent => category.setSearchContent(searchContent),
                    get: h => category.getSearchContent(h),
                }),
            ],
        }),
    };
    return menuCategory;
}

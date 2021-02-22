import {ICategory} from "@launchmenu/core";
import {NoteCategory} from "../dataModel/NoteCategory";
import {createColorableMenuItem} from "./createColorableMenuItem";

/**
 * Creates a LM menu category for a given note category
 * @param category The note category to create the LM category for
 * @returns The LM category
 */
export function createNoteCategoryCategory(category: NoteCategory): ICategory {
    const menuCategory: ICategory = {
        name: category.ID,
        item: createColorableMenuItem({
            asCategory: () => menuCategory,
            name: h => category.getName(h),
            color: h => category.getColor(h),
            onExecute: () => console.log("exec"),
        }),
    };
    return menuCategory;
}

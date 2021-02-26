import {ICategory} from "../../../../actions/types/category/_types/ICategory";
import {IAdvancedCategoryData} from "./_types/IAdvancedCategoryData";
import {createAdvancedCategoryMenuItem} from "./createAdvancedCategoryMenuItem";

/**
 * Creates an advanced menu category
 * @param config The config for the menu item
 * @returns The created menu category
 */
export function createAdvancedCategory({
    name,
    displayName,
    ...rest
}: IAdvancedCategoryData): ICategory {
    const category: ICategory = {
        name,
        item: createAdvancedCategoryMenuItem(
            {name: displayName ?? name, ...rest},
            () => category
        ),
    };
    return category;
}

import {ICategory} from "../actions/types/category/_types/ICategory";
import {createStandardMenuItem} from "../items/createStandardMenuItem";
import {searchAction} from "../actions/types/search/searchAction";
import {adjustBindings} from "../items/adjustBindings";

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
    const item = createStandardMenuItem({name, description});
    return {
        name,
        description,
        item: {
            view: item.view,
            actionBindings: adjustBindings(item.actionBindings, bindings =>
                bindings.filter(binding => !searchAction.canBeAppliedTo([binding]))
            ),
        },
    };
}
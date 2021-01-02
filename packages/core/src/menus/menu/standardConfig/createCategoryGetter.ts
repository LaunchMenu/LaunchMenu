import {IDataHook} from "model-react";
import {getCategoryAction} from "../../../actions/types/category/getCategoryAction";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";

/**
 * Creates a standard category getter
 * @param context The context to use for settings
 * @returns The category getter
 */
export function createCategoryGetter(
    context: IIOContext
): {(item: IMenuItem | IPrioritizedMenuItem, hook: IDataHook): ICategory | undefined} {
    const {showCategories} = context.settings.get(baseSettings).menu;
    return (item, hook) =>
        showCategories.get(hook) ? getCategoryAction.getCategory(item, hook) : undefined;
}

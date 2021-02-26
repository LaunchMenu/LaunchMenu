import {
    createStandardMenuItem,
    getControlsCategory,
    IMenuItem,
    ProxiedMenu,
    UILayer,
} from "@launchmenu/core";
import {DataCacher} from "model-react";
import {NotesSource} from "../../dataModel/NotesSource";
import {createAddNoteCategoryMenuItem} from "../categories/controls/createAddNoteCategoryMenuItem";
import {createNoteCategoryMenuItem} from "../categories/createNoteCategoryMenuItem";

/**
 * Creates a new menu item that can be used to edit the categories of notes
 * @param notesSource The notes source to be edited
 * @returns The item to open the categories editors
 */
export function createEditCategoriesMenuItem(notesSource: NotesSource): IMenuItem {
    return createStandardMenuItem({
        name: "Edit categories",
        category: getControlsCategory(),
        onExecute: ({context}) => {
            const categoryItems = new DataCacher<{
                map: Map<string, IMenuItem>;
                items: IMenuItem[];
            }>((h, prev) => {
                const categories = notesSource.getAllCategories(h);
                const map = new Map<string, IMenuItem>(prev?.map ?? []);
                return {
                    items: categories.map(category => {
                        let item = map.get(category.ID);
                        if (!item) {
                            item = createNoteCategoryMenuItem(category);
                            map.set(category.ID, item);
                        }
                        return item;
                    }),
                    map,
                };
            });
            const controls = new DataCacher(h => [
                createAddNoteCategoryMenuItem(notesSource),
            ]);
            const allItems = new DataCacher(h => [
                ...categoryItems.get(h).items,
                ...controls.get(h),
            ]);

            // Create and open the menu
            const menu = new ProxiedMenu(context, h => allItems.get(h));
            context.open(
                new UILayer({
                    menu,
                })
            );
        },
    });
}

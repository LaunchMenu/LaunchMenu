import {
    declare,
    searchAction,
    UILayer,
    ProxiedMenu,
    IMenuItem,
    baseSettings,
    createCategoryDummyItem,
    IMenu,
} from "@launchmenu/core";
import {notePatternMatcher} from "./notePatternMatcher";
import {DataCacher, getAsync, waitFor} from "model-react";
import {NotesSource} from "./dataModel/NotesSource";
import {notesIcon} from "./notesIcon";
import {createNoteMenuItem} from "./interface/createNoteMenuItem";
import {createNoteCategoryCategory} from "./interface/categories/createNoteCategoryCategory";
import {createAddNoteMenuItem} from "./interface/controls/createAddNoteMenuItem";
import {createImportNoteMenuItem} from "./interface/controls/createImportNoteMenuItem";
import {Note} from "./dataModel/Note";
import {createEditCategoriesMenuItem} from "./interface/controls/createEditCategoriesMenuItem";
import {settings} from "./settings";
import {createListCacher} from "./util/createListCacher";
import {createAddNoteCategoryMenuItem} from "./interface/categories/controls/createAddNoteCategoryMenuItem";
import {createSelectInMenuCallback} from "./util/createSelectInMenuCallback";
import {NoteCategory} from "./dataModel/NoteCategory";
import {createEditMetadataMenuItem} from "./interface/controls/createEditMetadataMenuItem";

export const info = {
    name: "Notes",
    description: "A notes applet",
    version: "0.0.0",
    icon: notesIcon,
} as const;

export default declare({
    info,
    settings,
    init({settings: initSettings}) {
        // Setup the notes source together with its item interfaces
        const notesSource = new DataCacher(h => {
            const {notesDir, defaults} = initSettings;
            const path = notesDir.get(h);
            return new NotesSource(`${path}/notes.json`, {
                color: h => defaults.color.get(h),
                fontSize: h => defaults.fontSize.get(h),
                showRichContent: h => defaults.showRichContent.get(h),
                syntaxMode: h => defaults.syntaxMode.get(h),
                searchContent: h => defaults.searchContent.get(h),
            });
        });

        // Create all categories, note items and items to search for categories
        const categories = createListCacher(
            h => notesSource.get(h).getAllCategories(h),
            category => category.ID,
            category => createNoteCategoryCategory(category)
        );
        const notesItems = createListCacher(
            h => notesSource.get(h).getAllNotes(h),
            note => note.ID,
            note =>
                createNoteMenuItem(
                    note,
                    notesSource.get(),
                    h => categories.get(h).items,
                    initSettings
                )
        );

        // Create some items that can be used to show categories even if they are empty
        const categoryEmptyItems = createListCacher(
            h => categories.get(h).items,
            category => category.name,
            category =>
                createCategoryDummyItem({
                    category,
                })
        );

        return {
            async search(query, hook) {
                // Only search the notes, not all the controls and categories
                return {
                    patternMatch: notePatternMatcher(query, hook),
                    children: searchAction.get(notesItems.get(hook).items),
                };
            },
            open({context, onClose}) {
                // Create some callbacks for when new items are added to this menu (in order to select them)
                const onCreateNote = createSelectInMenuCallback(
                    () => menu,
                    (note: Note, h) => notesItems.get(h).map.get(note.ID)
                );
                const onCreateCategory = createSelectInMenuCallback(
                    () => menu,
                    (noteCategory: NoteCategory, h) =>
                        categories.get(h).map.get(noteCategory.ID)?.item
                );

                // Create the menu with its controls
                const controls = new DataCacher(h => [
                    createAddNoteMenuItem(notesSource.get(h), onCreateNote),
                    ...(context.settings.get(settings).inlineCategory.get(h)
                        ? [createEditCategoriesMenuItem(notesSource.get(h))]
                        : [
                              createAddNoteCategoryMenuItem(
                                  notesSource.get(h),
                                  onCreateCategory
                              ),
                          ]),
                    ...(context.settings.get(baseSettings).advancedUsage.get(h)
                        ? [
                              createImportNoteMenuItem(notesSource.get(h), onCreateNote),
                              createEditMetadataMenuItem(notesSource.get(h)),
                          ]
                        : []),
                ]);
                const allItems = new DataCacher(h => [
                    ...notesItems.get(h).items,
                    ...(context.settings.get(settings).inlineCategory.get(h)
                        ? []
                        : categoryEmptyItems.get(h).items),
                    ...controls.get(h),
                ]);
                const menu: IMenu = new ProxiedMenu(context, h => allItems.get(h));

                context.open(
                    new UILayer(
                        () => ({
                            icon: notesIcon,
                            menu: menu,
                            onClose,
                        }),
                        {path: "Notes"}
                    )
                );
            },
            onDispose: () => notesSource.get().destroy(),
        };
    },
});

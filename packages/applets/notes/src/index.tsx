import {
    declare,
    searchAction,
    UILayer,
    ProxiedMenu,
    IMenuItem,
    executeAction,
    baseSettings,
} from "@launchmenu/core";
import {notePatternMatcher} from "./notePatternMatcher";
import {DataCacher, getAsync, waitFor} from "model-react";
import {NotesSource} from "./dataModel/NotesSource";
import {notesIcon} from "./notesIcon";
import {createNoteMenuItem} from "./interface/createNoteMenuItem";
import {createNoteCategoryCategory} from "./interface/createNoteCategoryCategory";
import {createAddNoteMenuItem} from "./interface/controls/createAddNoteMenuItem";
import {createImportNoteMenuItem} from "./interface/controls/createImportNoteMenuItem";
import {Note} from "./dataModel/Note";
import {createEditCategoriesMenuItem} from "./interface/controls/createEditCategoriesMenuItem";
import {settings} from "./settings";

export const info = {
    name: "Notes",
    description: "A notes applet",
    version: "0.0.0",
    icon: notesIcon,
} as const;

export default declare({
    info,
    settings,
    init({getSettings}) {
        // Setup the notes source together with its item interfaces
        const notesSource = new DataCacher(h => {
            const {notesDir, defaults} = getSettings(h).get(settings);
            const path = notesDir.get(h);
            return new NotesSource(`${path}/notes.json`, {
                color: h => defaults.color.get(h),
                fontSize: h => defaults.fontSize.get(h),
                showRichContent: h => defaults.showRichContent.get(h),
                syntaxMode: h => defaults.syntaxMode.get(h),
                searchContent: h => defaults.searchContent.get(h),
            });
        });
        const categories = new DataCacher(h => {
            const noteCategories = notesSource.get(h).getAllCategories(h);
            return noteCategories.map(category => createNoteCategoryCategory(category));
        });
        const notesItems = new DataCacher<{
            map: Map<string, IMenuItem>;
            items: IMenuItem[];
        }>((h, prev) => {
            const notes = notesSource.get(h).getAllNotes(h);
            const map = new Map<string, IMenuItem>(prev?.map ?? []);
            return {
                items: notes.map(note => {
                    let item = map.get(note.ID);
                    if (!item) {
                        item = createNoteMenuItem(
                            note,
                            notesSource.get(),
                            h => categories.get(h),
                            getSettings(h)
                        );
                        map.set(note.ID, item);
                    }
                    return item;
                }),
                map,
            };
        });

        return {
            async search(query, hook) {
                return {
                    patternMatch: notePatternMatcher(query, hook),
                    children: searchAction.get(notesItems.get(hook).items),
                };
            },
            open({context, onClose}) {
                // Setup a menu with controls
                const createCallback = async (note: Note, initial: boolean) => {
                    if (!initial) return;

                    // Wait for a note item to exist
                    await waitFor(h => !!notesItems.get(h).map.get(note.ID));
                    const item = notesItems.get().map.get(note.ID) as IMenuItem;

                    // Wait for the menu to contain the item
                    await waitFor(h => menu.getItems(h).includes(item));
                    menu.setCursor(item);

                    // Start editing the note
                    await getAsync(h => note.getText(h));
                    executeAction.execute(menu);
                };
                const controls = new DataCacher(h => [
                    createAddNoteMenuItem(notesSource.get(h), createCallback),
                    createEditCategoriesMenuItem(notesSource.get(h)),
                    ...(context.settings.get(baseSettings).advancedUsage.get(h)
                        ? [createImportNoteMenuItem(notesSource.get(h), createCallback)]
                        : []),
                ]);
                const allItems = new DataCacher(h => [
                    ...notesItems.get(h).items,
                    ...controls.get(h),
                ]);
                const menu = new ProxiedMenu(context, h => allItems.get(h));

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

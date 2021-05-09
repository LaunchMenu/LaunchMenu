import {
    adjustSearchable,
    createFolderMenuItem,
    createGlobalContextBinding,
    createStandardMenuItem,
    IActionBinding,
    identityAction,
    IMenuItem,
    IMenuSearchable,
    IQuery,
    isActionBindingFor,
    ISettingsFolderMenuItem,
    Priority,
    searchAction,
    settingPatternMatcher,
    SettingsManager,
    tracedRecursiveSearchHandler,
} from "@launchmenu/core";
import {settings} from ".";
import {settingsFolderHandler} from "./settingsFolderHandler";
import {v4 as UUID} from "uuid";

/**
 * Creates the bindings for all global settings items
 * @param settings The base settings for the context menu
 * @param appletSettings The settings for the currently opened applet
 * @returns The menu item folder containing the given settings
 */
export function createGlobalSettingsBindings<
    S extends ISettingsFolderMenuItem,
    AS extends ISettingsFolderMenuItem
>({
    settingsFolder,
    selectedAppletSettingsFolder,
    fileControls,
    settingsManager,
}: {
    settingsFolder: S[];
    selectedAppletSettingsFolder?: AS;
    settingsManager: SettingsManager;
    /** Whether to include save and reload buttons */
    fileControls?: boolean;
}): IActionBinding[] {
    const allSettings = createGlobalContextBinding(
        {
            priority: Priority.LOW,
            item: createFolderMenuItem({
                name: "All settings",
                children: settingsFolder,
                searchChildren: (query: IQuery) =>
                    settingPatternMatcher(query) ? settingsFolder : [],
            }),
        },
        settingsFolderHandler
    );

    const selectedSettings =
        selectedAppletSettingsFolder &&
        createGlobalContextBinding(
            {
                priority: [Priority.LOW, Priority.HIGH],
                item: addSettingsPatternMask(selectedAppletSettingsFolder),
            },
            settingsFolderHandler
        );

    const save =
        fileControls &&
        createGlobalContextBinding(
            {
                priority: [Priority.HIGH, Priority.HIGH],
                item: createStandardMenuItem({
                    name: "Save settings",
                    onExecute: () => settingsManager.saveAll(),
                    shortcut: (context, h) =>
                        context.settings.get(settings).controls.save.get(h),
                }),
            },
            settingsFolderHandler
        );

    const load =
        fileControls &&
        createGlobalContextBinding(
            {
                priority: Priority.HIGH,
                item: createStandardMenuItem({
                    name: "Reload settings",
                    onExecute: () => settingsManager.saveAll(),
                    shortcut: (context, h) =>
                        context.settings.get(settings).controls.load.get(h),
                }),
            },
            settingsFolderHandler
        );

    return [
        allSettings,
        ...(selectedSettings ? [selectedSettings] : []),
        ...(save ? [save] : []),
        ...(load ? [load] : []),
    ];
}

/**
 * Adds a search 'mask' to the item, such that children are only searched through if the query contains the settings pattern
 * @param item The item to add the mask to
 * @returns The newly created item
 */
export function addSettingsPatternMask(item: IMenuItem): IMenuItem {
    return identityAction.copyItem(item, bindings => {
        const nonSearchActions = bindings.filter(
            binding => !isActionBindingFor(searchAction, binding)
        );

        const ID = UUID();
        const searchBinding = tracedRecursiveSearchHandler.createBinding(getTrace => ({
            ID,
            search: async (query, hook) => {
                // Get all original results by obtaining recursive and non recursive results
                const originalRecursiveResults = tracedRecursiveSearchHandler
                    .get([{actionBindings: bindings}])
                    .getSearchables(getTrace);
                const originalNonRecursiveResults = searchAction.get([
                    {
                        actionBindings: bindings.filter(
                            binding =>
                                !isActionBindingFor(tracedRecursiveSearchHandler, binding)
                        ),
                    },
                ]);
                const originalResults = [
                    ...originalNonRecursiveResults,
                    ...originalRecursiveResults,
                ];

                // If the pattern matches, just return the children as the original item would obtain
                if (settingPatternMatcher(query)) return {children: originalResults};
                // If the pattern doesn't match, only return the direct result, but not their children
                else
                    return {
                        children: originalResults.map(
                            (searchable): IMenuSearchable =>
                                adjustSearchable(searchable, {
                                    children: () => [],
                                    // Make the ID different, such that the searcher notices these are different nodes
                                    ID: ID => `capped-${ID}`,
                                })
                        ),
                    };
            },
        }));

        return [searchBinding, ...nonSearchActions];
    });
}

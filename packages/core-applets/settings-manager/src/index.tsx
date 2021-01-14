import {
    adjustSearchable,
    createBooleanSetting,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    declare,
    KeyPattern,
    ProxiedMenu,
    searchAction,
    settingPatternMatcher,
    UILayer,
} from "@launchmenu/core";
import {DataCacher} from "model-react";
import {createGlobalSettingsBindings} from "./createGlobalSettingsBindings";
import {setupAutoSaveHandler} from "./setupAutoSaveHandler";

export const info = {
    name: "Settings manager",
    description: "An applet to manage all settings within LaunchMenu",
    version: "0.0.0",
    icon: "settings",
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                autoSave: createBooleanSetting({name: "Auto save", init: true}),
                controls: createSettingsFolder({
                    name: "Controls",
                    children: {
                        save: createKeyPatternSetting({
                            name: "Save settings",
                            init: new KeyPattern("ctrl+s"),
                        }),
                        load: createKeyPatternSetting({
                            name: "Reload settings",
                            init: new KeyPattern([]),
                        }),
                    },
                }),
            },
        }),
});

export default declare({
    info,
    settings,
    withLM: LM => {
        // Setup an auto save handler
        const manager = LM.getSettingsManager();
        const disposeAutoSave = setupAutoSaveHandler(manager);

        // Get data from the settings manager
        const settingsFolders = new DataCacher(h => {
            return manager.getAllSettingsData(h).map(settings => settings.file.settings);
        });
        const recursiveRootSearchables = new DataCacher(h => ({
            children: searchAction.get(settingsFolders.get(h)),
        }));
        const rootSearchables = new DataCacher(h => ({
            children: recursiveRootSearchables
                .get(h)
                .children // Get rid of the children, making the search not recursive
                .map(searchable =>
                    adjustSearchable(searchable, {
                        children: () => [],
                        // Make the ID different, such that the searcher notices these are different nodes
                        ID: ID => `capped-${ID}`,
                    })
                ),
        }));

        // Return the search, opening and context items data
        return {
            async search(query, h) {
                if (settingPatternMatcher(query)) return recursiveRootSearchables.get(h);
                return rootSearchables.get(h);
            },
            open({context, onClose}) {
                const menu = new ProxiedMenu(context, h => settingsFolders.get(h));
                context.open(
                    new UILayer(() => ({menu, onClose, icon: "settings"}), {
                        path: "./settings",
                    })
                );
            },
            withSession: session => ({
                // Retrieve a prioritized menu item to open global and selected applet setting
                globalContextMenuBindings: h => {
                    const selectedApplet = session.selectedApplet.get(h);
                    const settingsData =
                        selectedApplet && manager.getSettingsData(selectedApplet.ID);
                    return createGlobalSettingsBindings({
                        settingsFolder: settingsFolders.get(h),
                        selectedAppletSettingsFolder: settingsData?.file.settings,
                        settingsManager: manager,
                        fileControls: !manager
                            .getSettingsContext(h)
                            .get(settings)
                            .autoSave.get(h),
                    });
                },
            }),
            onDispose() {
                disposeAutoSave();
            },
        };
    },
});

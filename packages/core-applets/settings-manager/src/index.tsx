import {
    adjustSearchable,
    contextMenuAction,
    createGlobalContextBinding,
    createSettings,
    createSettingsFolder,
    declare,
    Menu,
    Priority,
    ProxiedMenu,
    searchAction,
    settingPatternMatcher,
    UILayer,
} from "@launchmenu/core";
import {DataCacher, Field} from "model-react";
import {createSettingsContextMenuItem} from "./createSettingsContextMenuItem";

export const info = {
    name: "Settings manager",
    description: "An applet to manage all settings within LaunchMenu",
    version: "0.0.0",
    icon: "search", // TODO: add some kind of cog icon
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    withLM: LM => {
        // Get data from the settings manager
        const manager = LM.getSettingsManager();
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
                context.open(new UILayer(() => ({menu, onClose}), {path: "./settings"}));
            },
            withSession: session => ({
                // Retrieve a prioritized menu item to open global and selected applet setting
                globalContextMenuBindings: (h = null) => {
                    const selectedApplet = session.selectedApplet.get(h);
                    const settingsData =
                        selectedApplet && manager.getSettingsData(selectedApplet.ID);
                    return [
                        createGlobalContextBinding({
                            priority: [Priority.LOW, Priority.LOW],
                            item: createSettingsContextMenuItem({
                                settings: settingsFolders.get(h),
                                appletSettings: settingsData?.file.settings,
                            }),
                        }),
                    ];
                },
            }),
        };
    },
});

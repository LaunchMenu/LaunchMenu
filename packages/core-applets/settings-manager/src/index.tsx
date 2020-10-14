import {
    adjustSearchable,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    Menu,
    Observer,
    searchAction,
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
        const rootSearchables = new DataCacher(h => ({
            children: searchAction
                .get(settingsFolders.get(h))
                // Get rid of the children, making the search not recursive
                .map(searchable => adjustSearchable(searchable, {children: () => []})),
        }));

        // Return the search, opening and context items data
        return {
            async search(query, h) {
                return rootSearchables.get(h);
            },
            open({context, onClose}) {
                // TODO: add listener for the folders to update menu on changes
                const menu = new Menu(context, settingsFolders.get(null));
                context.open(new UILayer(() => ({menu, onClose})));
            },
            withSession: session => ({
                // Retrieve a prioritized menu item to open global and selected applet setting
                globalContextMenuItems: (h = null) => {
                    const selectedApplet = session.selectedApplet.get(h);
                    const settingsData =
                        selectedApplet && manager.getSettingsData(selectedApplet.ID);
                    return [
                        () => ({
                            priority: 1,
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

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
} from "@launchmenu/core";
import {Field} from "model-react";

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
        const settingsFolders = new Field([] as IMenuItem[]);
        const manager = LM.getSettingsManager();
        const settingsObserver = new Observer(h => manager.getAllSettingsData(h)).listen(
            settingsSets => {
                settingsFolders.set(settingsSets.map(settings => settings.file.settings));
            },
            true
        );
        return {
            async search(query, h) {
                return {
                    children: searchAction
                        .get(settingsFolders.get(h))
                        // Get rid of the children, making the search not recursive
                        .map(searchable =>
                            adjustSearchable(searchable, {children: () => []})
                        ),
                };
            },
            open({context, onClose}) {
                // TODO: add listener for the folders
                const menu = new Menu(context, settingsFolders.get(null));
                context.openUI({menu}, onClose);
            },
            onDispose: () => settingsObserver.destroy(),
        };
    },
});

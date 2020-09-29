import {
    createSettings,
    createSettingsFolder,
    declare,
    IMenuItem,
    Observer,
    searchAction,
} from "@launchmenu/launchmenu";
import {Field} from "model-react";
import {createAppletMenuItem} from "./createAppletMenuItem";

export const info = {
    name: "Applets manager",
    description: "An applet to manage all applets within LaunchMenu",
    version: "0.0.0",
    icon: "search", // TODO: add some kind of management icon
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export const appletItems = new Field([] as IMenuItem[]);
export default declare({
    info,
    settings,
    async search(query, h) {
        return {
            children: searchAction.get(appletItems.get(h)),
        };
    },
    onInit(lm) {
        const manager = lm.getAppletManager();
        const appletsObserver = new Observer(h => manager.getApplets(h)).listen(
            applets => {
                appletItems.set(applets.map(applet => createAppletMenuItem(applet)));
            },
            true
        );

        return () => appletsObserver.destroy();
    },
    open(onClose) {
        // TODO:
        console.log("detect");
    },
    development: {
        onReload(session): void {
            session.searchField.set("applet: ");
        },
    },
});

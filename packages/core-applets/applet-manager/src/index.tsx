import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    Observer,
    searchAction,
} from "@launchmenu/core";
import {DataCacher, Field} from "model-react";
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

export default declare({
    info,
    settings,
    withSession: session => {
        const appletItems = new DataCacher(h =>
            session.getApplets(h).map(applet => createAppletMenuItem(applet, session))
        );

        return {
            async search(query, h) {
                return {
                    children: searchAction.get(appletItems.get(h)),
                };
            },
            open({context, onClose}) {
                // TODO:
                console.log("detect");
            },
            development: {
                onReload(): void {
                    // session.searchField.set("or");
                },
            },
        };
    },
});
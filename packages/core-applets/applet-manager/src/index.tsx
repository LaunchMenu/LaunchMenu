import {
    CoreAppletType,
    createSettings,
    createSettingsFolder,
    declare,
    searchAction,
} from "@launchmenu/core";
import {DataCacher} from "model-react";
import {createAppletMenuItem} from "./createAppletMenuItem";

export const info = {
    name: "Applets manager",
    description: "An applet to manage all applets within LaunchMenu",
    version: "0.0.0",
    icon: "applets",
} as const;

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
    coreCategory: CoreAppletType.APPLETS,
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

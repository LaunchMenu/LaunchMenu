import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    Observer,
    searchAction,
} from "@launchmenu/core";
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
    // onInit(lm) {
    //     const manager = lm.getAppletManager();
    //     const appletsObserver = new Observer(h => manager.getApplets(h)).listen(
    //         applets => {
    //             appletItems.set(applets.map(applet => createAppletMenuItem(applet)));
    //         },
    //         true
    //     );

    //     return () => appletsObserver.destroy();
    // },
    async search(query, h) {
        return {
            children: searchAction.get([
                ...appletItems.get(h),
                createStandardMenuItem({name: "oranges"}),
            ]),
        };
    },
    open({context, onClose}) {
        // TODO:
        console.log("detect");
    },
    withSession: session => ({
        development: {
            onReload(): void {
                // session.searchField.set("or");
            },
        },
    }),
});

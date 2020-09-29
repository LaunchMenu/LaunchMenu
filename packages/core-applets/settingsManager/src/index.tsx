import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    searchAction,
} from "@launchmenu/launchmenu";

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

const item = createStandardMenuItem({
    name: "hoi",
    onExecute({context}) {
        console.log("hoi");
    },
});
const item2 = createStandardMenuItem({
    name: "bye",
    onExecute({context}) {
        console.log("bye");
    },
});
export default declare({
    info,
    settings,
    async search(query) {
        return {
            children: searchAction.get([item, item2]),
        };
    },
    development: {
        onReload(session): void {
            session.searchField.set("hoi");
        },
    },
});

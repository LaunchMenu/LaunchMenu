import {declare} from "@launchmenu/launchmenu/build/application/applets/declare";
import {createSettings} from "@launchmenu/launchmenu/build/settings/createSettings";
import {createSettingsCategory} from "@launchmenu/launchmenu/build/settings/inputs/createSettingsCategory";

export const info = {
    name: "Settings",
    description: "An applet to manage all settings within LaunchMenu",
    version: "0.0.0",
    icon: "search", // TODO: add some kind of cog icon
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsCategory({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    development: {
        onReload(session): void {
            session.searchField.set("test");
        },
    },
});

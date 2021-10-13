import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    searchAction,
} from "@launchmenu/core";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
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
    init({LM}) {
        const items = [
            createStandardMenuItem({
                name: "Hide window",
                onExecute: () => LM.setWindowOpen(false),
            }),
        ];

        return {
            async search(query, hook) {
                return {
                    children: searchAction.get(items),
                };
            },
        };
    },
});

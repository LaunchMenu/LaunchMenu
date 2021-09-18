import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    globalContextFolderHandler,
    Priority,
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
    globalContextMenuBindings: [
        globalContextFolderHandler.createBinding({
            item: {
                // End your priority array with a random number, to help prevent collisions
                priority: [Priority.HIGH, 34],
                // Specify any menu item you like
                item: createStandardMenuItem({
                    name: "My action",
                    onExecute: () => alert("Hello"),
                }),
            },
            // Don't show count for this action, since presence isn't related to selected items
            preventCountCategory: true,
            // There is no action that this menu item is for
            action: null,
        }),
    ],
});

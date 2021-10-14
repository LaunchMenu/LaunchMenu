import {
    createContextAction,
    createSettings,
    createSettingsFolder,
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

const myAction = createContextAction({
    name: "My action",
    contextItem: {
        priority: Priority.HIGH,
    },
    // Add the item to the global folder
    folder: globalContextFolderHandler,
    // Don't show count for this action, since presence isn't related to selected items
    preventCountCategory: true,
    // We can just specify `void` if the action takes no data
    core: (data: void[]) => {
        return {
            execute: () => alert("Hello"),
        };
    },
});

export default declare({
    info,
    settings,
    globalContextMenuBindings: [myAction.createBinding()],
});

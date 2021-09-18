import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStringSetting,
    declare,
    executeAction,
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
            children: {
                useName: createStringSetting({
                    name: "name",
                    init: "Bob",
                }),
            },
        }),
});

const items = [
    createStandardMenuItem({
        name: "Bye world",
        onExecute: ({context}) =>
            console.log(`Bye ${context.settings.get(settings).useName.get()}!`),
        // Pass additional bindings to the menu item (these have higher priority than the standard ones)
        actionBindings: [
            executeAction.createBinding(() => console.log(`Why are you here?`)),
            executeAction.createBinding(({context}) =>
                console.log(
                    `I don't like you ${context.settings.get(settings).useName.get()}!`
                )
            ),
        ],
    }),
];

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            children: searchAction.get(items),
        };
    },
});

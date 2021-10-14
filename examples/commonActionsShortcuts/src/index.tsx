import {
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    keyHandlerAction,
    KeyPattern,
    Menu,
    searchAction,
    shortcutHandler,
    UILayer,
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
                byeShortcut: createKeyPatternSetting({
                    name: "Bye shortcut",
                    init: new KeyPattern("ctrl+m"),
                }),
                byeShortcut2: createKeyPatternSetting({
                    name: "Bye shortcut2",
                    init: new KeyPattern("ctrl+d"),
                }),
            },
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello"),
        shortcut: () => new KeyPattern("ctrl+u"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye"),
        actionBindings: [
            shortcutHandler.createBinding({
                shortcut: context => context.settings.get(settings).byeShortcut.get(),
                onExecute: () => alert("Bye"),
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Super bye world",
        onExecute: () => alert("Super bye"),
        // Makes sure that `onExecute` of the item is used, even if multiple execute actions are added, or if the item is extended
        identityActionBindings: id => [
            shortcutHandler.createBinding({
                shortcut: context => context.settings.get(settings).byeShortcut2.get(),
                itemID: id,
            }),
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
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});

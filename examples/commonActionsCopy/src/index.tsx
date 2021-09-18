import {
    copyAction,
    copyTextHandler,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
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
    settings: () => createSettingsFolder({...info, children: {}}),
});

const items = [
    createStandardMenuItem({
        name: "Copy in context",
        onExecute: () => alert("Some other primary action"),
        actionBindings: [
            copyAction.createBinding(
                copyTextHandler.createBinding("This is copied from context")
            ),
        ],
    }),
    createStandardMenuItem({
        name: "Copy as primary",
        actionBindings: [copyTextHandler.createBinding("This is copied from primary")],
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

import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
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
            children: {},
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
    }),
];

export default declare({
    info,
    settings,
    async open({context, onClose}) {
        const menu = new Menu(context, items);
        await context.open(
            new UILayer(() => ({menu, onClose}), {
                path: "Example searchable",
            })
        );

        await context.open(
            new UILayer(
                {menu, searchable: false, destroyOnClose: false},
                {
                    path: "Example not searchable",
                }
            )
        );
    },
});

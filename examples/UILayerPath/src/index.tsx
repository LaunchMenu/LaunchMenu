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
        // Add `Example` and `oranges` to the previous path (which was empty)
        await context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example/oranges",
            })
        );

        // Remove the last item from the previous path, add `something`
        await context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "../something",
            })
        );

        // Don't change the path, but indicate that this layer belongs to the same path now
        await context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: ".",
            })
        );
    },
});

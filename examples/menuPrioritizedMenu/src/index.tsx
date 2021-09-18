import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    PrioritizedMenu,
    Priority,
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
    {
        priority: Priority.MEDIUM,
        item: createStandardMenuItem({
            name: "Hello world",
            onExecute: () => alert("Hello!"),
        }),
    },
    {
        priority: Priority.HIGH,
        item: createStandardMenuItem({
            name: "Bye world",
            onExecute: () => alert("Bye!"),
        }),
    },
];

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new PrioritizedMenu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});

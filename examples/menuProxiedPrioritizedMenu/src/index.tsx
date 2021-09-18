import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    IPrioritizedMenuItem,
    Menu,
    ProxiedPrioritizedMenu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {Field} from "model-react";

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

function createItem(name: string): IPrioritizedMenuItem {
    const item: IPrioritizedMenuItem = {
        priority: Math.random(),
        item: createStandardMenuItem({
            name,
            onExecute: () => items.set(items.get().filter(i => item != i)),
        }),
    };
    return item;
}

const items = new Field(
    ["potatoe", "oranges", "slices", "napkins", "water"].map(name => createItem(name))
);

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new UILayer(
                () => ({
                    menu: new ProxiedPrioritizedMenu(context, h => items.get(h)),
                    onClose,
                }),
                {
                    path: "Example",
                }
            )
        );
    },
});

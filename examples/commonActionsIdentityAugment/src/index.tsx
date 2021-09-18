import React from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    menuItemIdentityAction,
    scrollableContentHandler,
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

const baseItems = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye"),
    }),
];

const items = baseItems.map(item =>
    menuItemIdentityAction.copyItem(item, [
        scrollableContentHandler.createBinding(<Box>My cool content</Box>),
    ])
);

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

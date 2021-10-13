import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
    Box,
} from "@launchmenu/core";
import Path from "path";

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
        description:
            "I would like to welcome you to the marvelous world of LaunchMenu applets!",
        tags: ["This text can be searched, but isn't visible"],
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        content: <Box padding="small">This content here isn't searchable</Box>,
        icon: <img height={30} src={Path.join(__dirname, "..", "images", "icon.png")} />,
        onExecute: () => alert("Bye!"),
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

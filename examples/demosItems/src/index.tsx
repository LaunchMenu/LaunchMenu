import Path from "path";
import React from "react";
import {
    Box,
    createFolderMenuItem,
    createSettings,
    createSettingsFolder,
    createStandardCategory,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";

export const info = {
    name: "HelloWorld",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
});

const category = createStandardCategory({
    name: "Hello",
});
const items = [
    createStandardMenuItem({
        name: "Hello world",
        icon: <img width={30} src={Path.join(__dirname, "..", "images", "icon.png")} />,
        content: <Box>Hello world!</Box>,
        onExecute: () => alert(`Hello john!`),
    }),
    createFolderMenuItem({
        name: "Some folder",
        category,
        children: [
            createStandardMenuItem({
                name: "Bye world",
                description: "More items within this directory",
                content: <Box>Bye world!</Box>,
                onExecute: () => alert(`Bye bob`),
            }),
        ],
    }),
];

export default declare({
    info,
    settings,
    search: async (query, hook) => ({children: searchAction.get(items)}),
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});

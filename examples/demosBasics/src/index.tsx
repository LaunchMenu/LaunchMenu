import Path from "path";
import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStringSetting,
    declare,
    searchAction,
} from "@launchmenu/core";

export const info = {
    name: "HelloWorld",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: <img width={30} src={Path.join(__dirname, "..", "images", "icon.png")} />,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                username: createStringSetting({name: "Username", init: "Bob"}),
            },
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: ({context}) =>
            alert(`Hello ${context.settings.get(settings).username.get()}!`),
    }),
];

export default declare({
    info,
    settings,
    search: async (query, hook) => ({children: searchAction.get(items)}),
});

import React from "react";
import {
    Box,
    Content,
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
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        content: <div>hoi</div>,
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
    open({context, onClose}) {
        context.open(
            new UILayer(
                () => ({
                    menu: new Menu(context, items),
                    content: new Content(
                        <Box background="secondary">Super cool example</Box>
                    ),
                    onClose,
                }),
                {
                    path: "Example",
                }
            )
        );
    },
});

import {Field} from "model-react";
import React from "react";
import {
    copyExitPasteHandler,
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
        name: "Hello world!",
        actionBindings: [copyExitPasteHandler.createBinding("Hello world!")],
    }),
    createStandardMenuItem({
        name: "Bye world!",
        actionBindings: [copyExitPasteHandler.createBinding("Bye world!")],
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

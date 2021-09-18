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
    createFolderMenuItem,
} from "@launchmenu/core";
import Path from "path";
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

// Object children
const people = createFolderMenuItem({
    name: "People",
    children: {
        Bob: createStandardMenuItem({
            name: "Bob",
            onExecute: () => alert("I'm Bob!"),
        }),
        Emma: createStandardMenuItem({
            name: "Emma",
            onExecute: () => alert("I'm Emma!"),
        }),
    },
});

// Dynamic children
const createDog = (name: string) => {
    const item = createStandardMenuItem({
        name,
        // Delete the dog on execution
        onExecute: () => dogsList.set(dogsList.get().filter(dog => dog != item)),
    });
    return item;
};
const dogsList = new Field([createDog("Max"), createDog("Jit")]);
const dogs = createFolderMenuItem({
    name: "Dogs",
    children: h => dogsList.get(h),
});

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            children: searchAction.get([people, dogs]),
        };
    },
    open({context, onClose}) {
        // Only show "Bob" in the menu
        const items = [people.children.Bob];
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});

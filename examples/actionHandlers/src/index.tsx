import {
    createAction,
    createSettings,
    createSettingsFolder,
    declare,
} from "@launchmenu/core";

const list = createAction({
    name: "list",
    core: (names: string[]) => {
        const namesString = names.join("\n");
        return {result: namesString};
    },
});

const listBulletPointHandler = createAction({
    name: "listBulletPointHandler",
    parents: [list],
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `• ${name}`);
        return {
            children: bulletPointNames.map(bulletPointName =>
                list.createBinding(bulletPointName)
            ),
            result: bulletPointNames,
        };
    },
});

const listDashHandler = createAction({
    name: "listDashHandler",
    parents: [list],
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `- ${name}`);
        return {
            children: bulletPointNames.map(bulletPointName =>
                list.createBinding(bulletPointName)
            ),
            result: bulletPointNames,
        };
    },
});

const item1 = {actionBindings: [listBulletPointHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [listDashHandler.createBinding("item3")]};
console.log(list.get([item1, item2, item3])); // == "• item1\n• item2\n- item3"

/************************************************************
 * This section isn't part of the example,                  *
 * just required for us to run this code as an LM applet    *
 * and get live reloading capabilities.                     *
 ************************************************************/
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

export default declare({
    info,
    settings,
});

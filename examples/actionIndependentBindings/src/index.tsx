import {
    createAction,
    createSettings,
    createSettingsFolder,
    declare,
} from "@launchmenu/core";

const names = createAction({
    name: "names",
    core: (names: string[]) => ({result: names}),
});

const item1 = {actionBindings: []};
const item2 = {
    actionBindings: [names.createBinding("item1"), names.createBinding("item1Alt")],
};
const item3 = {actionBindings: [names.createBinding("item2")]};

const items = [item1, item2, item3];
console.log(names.get(items)); // == ["item1", "item1Alt", "item2"]

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

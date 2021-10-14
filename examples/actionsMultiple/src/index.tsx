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
const ages = createAction({
    name: "ages",
    core: (ages: number[]) => ({result: ages}),
});

const item1 = {
    actionBindings: [
        names.createBinding("John"),
        names.createBinding("Johny"),
        ages.createBinding(12),
    ],
};
const item2 = {actionBindings: [ages.createBinding(5)]};
const item3 = {actionBindings: [names.createBinding("Bob")]};

const items = [item1, item2, item3];
console.log(names.get(items)); // == ["John", "Johny", "Bob"]
console.log(ages.get(items)); // == [12, 5]

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

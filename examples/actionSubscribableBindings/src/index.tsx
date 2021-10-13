import {
    createAction,
    createSettings,
    createSettingsFolder,
    declare,
} from "@launchmenu/core";
import {Field, Observer} from "model-react";

const list = createAction({
    name: "list",
    core: (names: string[]) => {
        const namesString = names.join("\n");
        return {result: namesString};
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

const item1Name = new Field("item1");
const item1 = {
    actionBindings: [
        listDashHandler.createBinding({subscribableData: h => item1Name.get(h)}),
    ],
};
const item2 = {actionBindings: [listDashHandler.createBinding("item2")]};

const listObserver = new Observer(h => list.get([item1, item2], h)).listen(listing => {
    console.log(listing);
}, true);

item1Name.set("bob");

/*
logs:
    - item1
    - item2
Followed by:
    - bob
    - item2
*/

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

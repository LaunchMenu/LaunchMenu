import React from "React";
import {
    contextMenuAction,
    createAction,
    createContextAction,
    createContextFolderHandler,
    createStringSetting,
    declare,
    IKeyEventListenerFunction,
    IOContextContext,
    openMenuExecuteHandler,
    Priority,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {createSettings} from "@launchmenu/core/build/settings/createSettings";
import {createSettingsFolder} from "@launchmenu/core/build/settings/inputs/createSettingsFolder";
import {createNumberSetting} from "@launchmenu/core/build/settings/inputs/createNumberSetting";
import {createStandardMenuItem} from "@launchmenu/core/build/menus/items/createStandardMenuItem";
import {Loader} from "model-react";

export const info = {
    name: "Test",
    description: "An applet only used for testing",
    version: "0.0.0",
    icon: "search",
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                someNumber: createNumberSetting({
                    name: "My number",
                    init: 5,
                }),
                something: createStringSetting({
                    name: "My string",
                    init: "hoi hoi bob",
                }),
            },
        }),
});

const folder1 = createContextFolderHandler({
    name: "bob",
    priority: 3,
});
const folder2 = createContextFolderHandler({
    name: "john",
    override: folder1,
    priority: 4,
});
const folder3 = createContextFolderHandler({
    name: "johny",
    parent: folder1,
    priority: 4,
});
const fakeAction = createContextAction({
    name: "eat pant",
    folder: folder2,
    core: function () {
        return {
            execute: () => console.log("yes"),
        };
    },
});

const item2 = createStandardMenuItem({
    name: "orange",
    content: (
        <div style={{backgroundColor: "orange"}}>
            <Loader>
                {h => (
                    <IOContextContext.Consumer>
                        {context => context?.settings.get(settings).something.get(h)}
                    </IOContextContext.Consumer>
                )}
            </Loader>
        </div>
    ),
    onExecute({context}) {
        const a = context.settings.get(settings).someNumber.get();
        console.log(context.settings, a);
    },
    actionBindings: [
        folder1.createBinding({
            item: {
                priority: Priority.HIGH,
                item: createStandardMenuItem({
                    name: "yes",
                    onExecute: () => console.log("hoi"),
                }),
            },
            action: null,
        }),
        fakeAction.createBinding(3),
    ],
});

const item = createStandardMenuItem({
    name: "oofy",
    content: <div style={{backgroundColor: "purple"}}>No</div>,
    onExecute({context}) {
        context.settings.get(settings).someNumber.set(20);
    },
    actionBindings: [
        openMenuExecuteHandler.createBinding({items: [item2], closeOnExecute: true}),
        fakeAction.createBinding(6),
        folder3.createBinding({
            item: {
                priority: Priority.HIGH,
                item: createStandardMenuItem({
                    name: "oranges",
                    onExecute: () => console.log("ya"),
                }),
            },
            action: null,
        }),
    ],
});

const item3 = createStandardMenuItem({
    name: "okay",
    onExecute({context}) {
        console.log("okay this");
    },
    actionBindings: [
        folder2.createBinding({
            item: {
                priority: Priority.HIGH,
                item: createStandardMenuItem({
                    name: "oranges",
                    onExecute: () => console.log("ya"),
                }),
            },
            action: null,
        }),
    ],
});

// Declare the applet's interface
export default declare({
    info,
    settings,
    globalContextMenuBindings(hook) {
        return [
            contextMenuAction.createBinding({
                action: null,
                preventCountCategory: true,
                item: {priority: 3, item},
            }),
        ];
    },
    async search(query) {
        return {
            children: searchAction.get([item, item2, item3]),
        };
    },

    withSession: session => ({
        development: {
            onReload() {
                console.log("detect");
                session.searchField.set("orange");
                const listener: IKeyEventListenerFunction = event => {
                    if (event.is(["ctrl", "s"])) {
                        session.LM.getSettingsManager().saveAll();
                        return true;
                    }
                    if (event.is(["ctrl", "m"])) {
                        console.log(session.LM.getSettingsManager());
                        return true;
                    }
                };
                const layer = new UILayer({contentHandler: listener});

                session.context.open(layer);
                return () => {
                    session.context.close(layer);
                };
            },
        },
    }),
});

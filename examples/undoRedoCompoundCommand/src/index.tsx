import React from "react";
import {
    CompoundCommand,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    globalContextFolderHandler,
    IAppletSessionInitializer,
    KeyPattern,
    Loader,
    Menu,
    Priority,
    searchAction,
    SetFieldCommand,
    UILayer,
} from "@launchmenu/core";
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

const setupUndoRedoControls: IAppletSessionInitializer = session => {
    if (!session.LM.isInDevMode()) return {};
    return {
        globalContextMenuBindings: [
            globalContextFolderHandler.createBinding({
                action: null,
                preventCountCategory: true,
                item: {
                    priority: Priority.LOW,
                    item: createStandardMenuItem({
                        name: "Undo",
                        shortcut: () => new KeyPattern("ctrl+z"),
                        onExecute: () => session.context.undoRedo.undo(),
                    }),
                },
            }),
            globalContextFolderHandler.createBinding({
                action: null,
                preventCountCategory: true,
                item: {
                    priority: Priority.LOW,
                    item: createStandardMenuItem({
                        name: "Redo",
                        shortcut: () => new KeyPattern("ctrl+y"),
                        onExecute: () => session.context.undoRedo.redo(),
                    }),
                },
            }),
        ],
    };
};

const count1 = new Field(0);
const count2 = new Field(0);
const content = (
    <Loader>
        {h => (
            <>
                count1: {count1.get(h)}, count2: {count2.get(h)}
            </>
        )}
    </Loader>
);
const getRandom = () => Math.floor(Math.random() * 5 + 1);
const items = [
    createStandardMenuItem({
        name: "Increment random",
        content,
        onExecute: () =>
            new CompoundCommand({name: "Increment"}, [
                new SetFieldCommand(count1, count1.get() + getRandom()),
                new SetFieldCommand(count2, count2.get() + getRandom()),
            ]),
    }),
    createStandardMenuItem({
        name: "Decrement random",
        content,
        onExecute: () =>
            new CompoundCommand({name: "Decrement"}, [
                new SetFieldCommand(count1, count1.get() - getRandom()),
                new SetFieldCommand(count2, count2.get() - getRandom()),
            ]),
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

    // There is currently no standard undo/redo applet yet, so we have to provide some controls ourselves for testing
    withSession: setupUndoRedoControls,
});

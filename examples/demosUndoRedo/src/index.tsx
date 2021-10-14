import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    globalContextFolderHandler,
    IAppletSessionInitializer,
    KeyPattern,
    Menu,
    Priority,
    SetFieldCommand,
    UILayer,
} from "@launchmenu/core";
import {Field} from "model-react";

export const info = {
    name: "HelloWorld",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
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

const createTimesItem = (name: string) => {
    const times = new Field(1);
    return createStandardMenuItem({
        name: hook => `${name} x${times.get(hook)}`,
        onExecute: () => new SetFieldCommand(times, times.get() + 1),
    });
};
const items = [createTimesItem("Hello world"), createTimesItem("Bye world")];

export default declare({
    info,
    settings,
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

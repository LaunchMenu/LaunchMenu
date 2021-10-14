import React from "react";
import {
    Command,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    globalContextFolderHandler,
    IAppletSessionInitializer,
    IField,
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

class RandomIncrementCommand extends Command {
    public metadata = {
        name: "Random increment",
    };

    protected field: IField<number>;
    protected max: number;
    protected newVal: number;
    protected oldVal: number;

    /**
     * Creates a new increment command
     * @param field The field to increment
     * @param max The maximum amount to increment by (can be negative to decrement)
     */
    public constructor(field: IField<number>, max: number = 5) {
        super();
        this.field = field;
        this.max = max;
    }

    /** @override */
    protected onExecute() {
        if (!this.newVal)
            this.newVal =
                this.field.get() +
                (this.max > 0 ? 1 : -1) *
                    Math.floor(Math.random() * Math.abs(this.max) + 1);
        this.oldVal = this.field.get();
        this.field.set(this.newVal);
    }

    /** @override */
    protected onRevert() {
        this.field.set(this.oldVal);
    }
}

const count = new Field(0);
const content = <Loader>{h => count.get(h)}</Loader>;
const items = [
    createStandardMenuItem({
        name: "Increment random",
        content,
        onExecute: () => new RandomIncrementCommand(count, 5),
    }),
    createStandardMenuItem({
        name: "Decrement random",
        content,
        onExecute: () => new RandomIncrementCommand(count, -5),
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

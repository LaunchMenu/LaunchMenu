import React from "react";
import {
    applicationResource,
    Command,
    CompoundCommand,
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
    Resource,
    searchAction,
    SetFieldCommand,
    standardTextResource,
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

class DelayedRandomIncrementCommand extends Command {
    public metadata = {
        name: "Random increment",
    };

    protected readonly dependencies: Resource[];

    protected field: IField<number>;
    protected max: number;
    protected newVal: number;
    protected oldVal: number;

    /**
     * Creates a new increment command
     * @param resource The resource that this command is dependent on
     * @param field The field to increment
     * @param max The maximum amount to increment by (can be negative to decrement)
     */
    public constructor(resource: Resource, field: IField<number>, max: number = 5) {
        super();
        this.field = field;
        this.max = max;

        this.dependencies = [resource];
    }

    /** @override */
    protected async onExecute() {
        await new Promise(res => setTimeout(res, 1000));
        this.oldVal = this.field.get();
        if (!this.newVal)
            this.newVal =
                this.field.get() +
                (this.max > 0 ? 1 : -1) *
                    Math.floor(Math.random() * Math.abs(this.max) + 1);
        this.field.set(this.newVal);
    }

    /** @override */
    protected async onRevert() {
        await new Promise(res => setTimeout(res, 1000));
        this.field.set(this.oldVal);
    }
}

const count1 = new Field(0);
const count2 = new Field(0);
const count1Resource = new Resource();
const count2Resource = new Resource();
const content = (
    <Loader>
        {h => (
            <>
                count1: {count1.get(h)}, count2: {count2.get(h)}
            </>
        )}
    </Loader>
);
const items = [
    createStandardMenuItem({
        name: "Increment parallelized",
        content,
        onExecute: () =>
            new CompoundCommand({name: "Increment"}, [
                new DelayedRandomIncrementCommand(count1Resource, count1),
                new DelayedRandomIncrementCommand(count2Resource, count2),
            ]),
    }),
    createStandardMenuItem({
        name: "Increment serialized",
        content,
        onExecute: () =>
            new CompoundCommand({name: "Increment"}, [
                new DelayedRandomIncrementCommand(applicationResource, count1),
                new DelayedRandomIncrementCommand(applicationResource, count2),
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

    // There is currently no standard undo/redo applet yet, so we have to provide some controls oureselves for testing
    withSession: setupUndoRedoControls,
});

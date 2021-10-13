import {
    contextMenuAction,
    createAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    executeAction,
    Menu,
    Priority,
    searchAction,
    UILayer,
} from "@launchmenu/core";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
});

const alertAllAction = createAction({
    name: "Alert all",
    parents: [contextMenuAction],
    core: function (data: string[]) {
        const combined = data.join(", ");
        return {
            // Create a binding for the context menu action in order to add an item to the context menu
            children: [
                contextMenuAction.createBinding({
                    action: this,
                    execute: [executeAction.createBinding(() => alert(combined))],
                    item: actionBindings => ({
                        priority: [Priority.MEDIUM, Priority.HIGH],
                        item: createStandardMenuItem({name: "Alert all", actionBindings}),
                    }),
                }),
            ],
            // We might as well return the computed data as a result,
            // such that this handler has some use as a stand-alone action
            result: combined,
        };
    },
});
const items = [
    createStandardMenuItem({
        name: "Hello!",
        onExecute: () => alert("Hello!"),
        actionBindings: [alertAllAction.createBinding("Hello")],
    }),
    createStandardMenuItem({
        name: "How are you?",
        onExecute: () => alert("How are you?"),
        actionBindings: [alertAllAction.createBinding("how are you")],
    }),
    createStandardMenuItem({
        name: "Goodbye!",
        onExecute: () => alert("Goodbye!"),
        actionBindings: [alertAllAction.createBinding("goodbye!")],
    }),
    createStandardMenuItem({
        name: "No alert all",
        onExecute: () => alert("Sad"),
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
});

import {
    createAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStringSetting,
    declare,
    executeAction,
    Menu,
    searchAction,
    sequentialExecuteHandler,
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

const alertAllHandler = createAction({
    name: "Alert all",
    parents: [executeAction],
    core: (data: string[]) => {
        const combined = data.join(", ");
        return {
            // Return the child binding that the execute action will use
            children: [executeAction.createBinding(() => alert(combined))],
            // We might as well return the computed data as a result,
            // such that this handler has some use as a stand-alone action
            result: combined,
        };
    },
});
const items = [
    createStandardMenuItem({
        name: "Hello!",
        actionBindings: [alertAllHandler.createBinding("Hello")],
    }),
    createStandardMenuItem({
        name: "How are you?",
        actionBindings: [alertAllHandler.createBinding("how are you")],
    }),
    createStandardMenuItem({
        name: "Goodbye!",
        actionBindings: [alertAllHandler.createBinding("goodbye!")],
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

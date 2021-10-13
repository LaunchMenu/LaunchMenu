import {
    createSettings,
    createSettingsFolder,
    createStandardCategory,
    createStandardMenuItem,
    declare,
    getCategoryAction,
    Menu,
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

const category = createStandardCategory({
    name: "Some category",
    description: "Some category for demonstration purposes",
});
const items = [
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye"),
        actionBindings: [getCategoryAction.createBinding(category)],
    }),
];

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
});

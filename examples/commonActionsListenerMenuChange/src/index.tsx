import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    onMenuChangeAction,
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
    settings: () => createSettingsFolder({...info, children: {}}),
});

const createItem = (name: string) => {
    const menuCount = new Field(0);
    return createStandardMenuItem({
        name: h => `${name}: ${menuCount.get(h)}`,
        onExecute: () => alert(name),
        actionBindings: [
            onMenuChangeAction.createBinding((menu, added) => {
                menuCount.set((added ? 1 : -1) + menuCount.get());
            }),
        ],
    });
};
const items = [createItem("Hello world"), createItem("Bye world")];

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

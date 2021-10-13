import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    onSelectAction,
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
    const selected = new Field(0);
    return createStandardMenuItem({
        name: h => (selected.get(h) > 0 ? `(${name})` : name),
        onExecute: () => alert(name),
        actionBindings: [
            onSelectAction.createBinding(sel => {
                console.log(sel);
                selected.set((sel ? 1 : -1) + selected.get());
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

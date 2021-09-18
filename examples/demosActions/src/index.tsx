import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {Field} from "model-react";
import {ITaskPriority, setTaskPriority} from "./setTaskPriority";

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

function createTaskMenuItem({name}: {name: string}) {
    const level = new Field<ITaskPriority>("medium");
    return createStandardMenuItem({
        name,
        description: hook => level.get(hook),
        onExecute: () => alert(level.get()),
        actionBindings: [setTaskPriority.createBinding(level)],
    });
}

const items = [
    createTaskMenuItem({name: "Meet Alice"}),
    createTaskMenuItem({name: "Make pancakes"}),
    createTaskMenuItem({name: "Free Hat"}),
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

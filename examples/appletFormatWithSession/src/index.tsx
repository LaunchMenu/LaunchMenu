import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
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
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    withSession: session => {
        const items = [
            createStandardMenuItem({
                name: "Hello world",
                // Adjust the session search on execution
                onExecute: () => session.searchField.set("Hi"),
            }),
            createStandardMenuItem({
                name: "Bye world",
                // Adjust the session search on execution
                onExecute: () => session.searchField.set("Goodbye"),
            }),
        ];

        return {
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
        };
    },
});

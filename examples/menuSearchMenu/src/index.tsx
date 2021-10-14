import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    SearchMenu,
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

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
    }),
];

export default declare({
    info,
    settings,
    open({context, onClose}) {
        const searchMenu = new SearchMenu(context);
        items.forEach(item => searchMenu.addSearchItem(item));
        searchMenu.setSearch("hell");

        context.open(
            new UILayer(() => ({menu: searchMenu, onClose}), {
                path: "Example",
            })
        );
    },
});

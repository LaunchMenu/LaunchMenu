import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IOContext,
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
    withSession: session => {
        function openMenu(context: IOContext, onClose?: () => void) {
            context.open(
                new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                    path: "Example",
                })
            );
        }

        // Return the same config as you usually would, with the addition of `development`
        return {
            async search(query, hook) {
                return {
                    children: searchAction.get(items),
                };
            },
            open({context, onClose}) {
                openMenu(context, onClose);
            },

            development: {
                onReload: () => {
                    // Open the new version of the menu
                    session.goHome();
                    openMenu(session.context);

                    return () => {
                        // Dispose some stuff before the next reload if required
                    };
                },
            },
        };
    },
});

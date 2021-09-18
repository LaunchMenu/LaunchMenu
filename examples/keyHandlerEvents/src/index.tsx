import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IKeyEventListener,
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
        const contentHandler: IKeyEventListener = event => {
            if (event.matches(["ctrl", "a", "s", "d"], "up")) {
                alert("ctrl+a+s+d released");
                return true;
            }
        };

        context.open(
            new UILayer(
                [
                    () => ({menu: new Menu(context, items), onClose}),
                    // Note only the contentHandler can be used without a view, menu and field handler's can't be used without a view
                    {contentHandler},
                ],
                {path: "Example"}
            )
        );
    },
});

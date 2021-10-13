import {
    baseSettings,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IOContext,
    KeyPattern,
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
        // Create custom controls
        const customMenuControls = {
            up: createKeyPatternSetting({
                name: "Up",
                init: new KeyPattern("ctrl+i"),
            }),
            down: createKeyPatternSetting({
                name: "Down",
                init: new KeyPattern("ctrl+k"),
            }),
        } as const;

        // Make a copy of the regular base settings, with the custom controls replaced
        const base = context.settings.getUI(baseSettings);
        const settingsContext = context.settings.augment(
            baseSettings,
            createSettingsFolder({
                name: "Base settings",
                children: {
                    ...base.children,
                    controls: createSettingsFolder({
                        name: "Controls",
                        children: {
                            ...base.children.controls.children,
                            menu: createSettingsFolder({
                                name: "Menu",
                                children: {
                                    ...base.children.controls.children.menu.children,
                                    ...customMenuControls,
                                },
                            }),
                        },
                    }),
                },
            })
        );

        // Create a new  context with these settings replaced
        const customContext = new IOContext({
            parent: context,
            settings: settingsContext,
        });

        // Open the layer (one you possibly don't have control over) in the custom context
        customContext.open(
            new UILayer(() => ({menu: new Menu(customContext, items), onClose}), {
                path: "Example",
            })
        );
    },
});

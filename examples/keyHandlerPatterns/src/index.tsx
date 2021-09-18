import {
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IKeyEventListener,
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

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                modifier: createKeyPatternSetting({
                    name: "Modifier",
                    // Simple key pattern constructor with limited intellisense for pattern validity checking
                    init: new KeyPattern("ctrl+shift"),
                }),
                pattern: createKeyPatternSetting({
                    name: "Pattern",
                    // Advanced key pattern constructor with proper intellisense
                    init: new KeyPattern([
                        {pattern: ["ctrl", "f"], type: "up", allowExtra: ["alt"]},
                    ]),
                }),
            },
        }),
});

export default declare({
    info,
    settings,
    open({context, onClose}) {
        const patterns = context.settings.get(settings);
        const contentHandler: IKeyEventListener = event => {
            if (patterns.pattern.get().matches(event)) {
                alert(`Pattern was matched, ${event.alt ? "with" : "without"} alt`);
                return true;
            }
            console.log(event);
            if (patterns.modifier.get().matchesModifier(event) && event.key.char) {
                alert(`${event.key.char} was pressed with the modifier`);
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

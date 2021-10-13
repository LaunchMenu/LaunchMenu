import {
    createGlobalKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    declare,
    KeyPattern,
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
            children: {
                globalAlert: createGlobalKeyPatternSetting({
                    name: "Global alert",
                    init: new KeyPattern("ctrl+i"),
                }),
            },
        }),
});

export default declare({
    info,
    settings,
    init: ({settings}) => {
        const removeKeyHandler = settings.globalAlert.onTrigger(() => {
            alert("Triggered");
        });

        return {
            onDispose() {
                removeKeyHandler();
            },
        };
    },
});

import React from "react";
import {
    baseSettings,
    createSettings,
    createSettingsFolder,
    declare,
    KeyEvent,
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
    async open({context, onClose}) {
        const back = context.settings.get(baseSettings).controls.common.back;
        const handleClose = (event: KeyEvent, close: () => void) => {
            if (back.get().matches(event)) {
                close();
                return true;
            }
        };

        await context.open(
            new UILayer(
                (context, close) => ({
                    onClose,
                    contentView: <div>Layer 1</div>,
                    contentHandler: event => {
                        if (handleClose(event, close)) return true;
                        if (event.matches("1")) {
                            alert("Detected 1");
                            return true;
                        }
                    },
                }),
                {path: "Layer 1"}
            )
        );

        // Open up a layer above that doesn't capture all events
        await context.open(
            new UILayer(
                (context, close) => ({
                    contentView: <div>Layer 2</div>,
                    contentHandler: event => {
                        if (handleClose(event, close)) return true;
                        if (event.matches("2")) {
                            alert("Detected 2");
                            return true;
                        }
                    },
                }),
                {
                    path: "Layer 2",
                    catchAllKeys: false,
                }
            )
        );

        // Open up a layer that does capture all events (defaults to capturing all)
        await context.open(
            new UILayer(
                (context, close) => ({
                    contentView: <div>Layer 3</div>,
                    contentHandler: event => {
                        if (handleClose(event, close)) return true;
                        if (event.matches("3")) {
                            alert("Detected 3");
                            return true;
                        }
                    },
                }),
                {path: "Layer 3"}
            )
        );
    },
});

import React from "react";
import {
    Content,
    createSettings,
    createSettingsFolder,
    declare,
    Loader,
    TextField,
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
    open({context, onClose}) {
        const field = new TextField("Bob", {start: 3, end: 3});
        const content = new Content(<Loader>{h => field.get(h)}</Loader>);

        context.open(
            new UILayer(() => ({field, content, handleClose: true, onClose}), {
                path: "Example",
            })
        );
    },
});

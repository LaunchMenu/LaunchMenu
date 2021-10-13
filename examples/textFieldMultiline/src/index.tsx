import React from "react";
import {
    createAdvancedTextFieldKeyHandler,
    createSettings,
    createSettingsFolder,
    declare,
    EditorField,
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
        context.open(
            new UILayer(
                (context, close) => {
                    const field = new TextField();
                    const handler = createAdvancedTextFieldKeyHandler(field, context, {
                        onExit: close,
                    });
                    const view = (
                        <EditorField
                            field={field}
                            options={{mode: "ace/mode/javascript"}}
                        />
                    );

                    return {contentView: view, contentHandler: handler, onClose};
                },
                {
                    path: "Example",
                }
            )
        );
    },
});

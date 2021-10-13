import React from "react";
import {
    createSettings,
    createSettingsFolder,
    declare,
    TextField,
    TextFieldView,
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
        const field = new TextField();
        context.open(
            new UILayer(
                () => ({
                    field,
                    fieldView: (
                        <TextFieldView
                            field={field}
                            css={{
                                fontWeight: "bold",
                                ".selection": {backgroundColor: "purple"},
                            }}
                        />
                    ),
                    handleClose: true,
                    onClose,
                }),
                {
                    path: "Example",
                }
            )
        );
    },
});

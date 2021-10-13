import {
    createSettings,
    createSettingsFolder,
    declare,
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
        const field = new TextField();
        context.open(
            new UILayer(
                () => ({
                    field,
                    icon: "edit",
                    handleClose: true,
                    onClose: () => {
                        alert(field.get());
                        onClose();
                    },
                }),
                {
                    path: "Example",
                }
            )
        );
    },
});

import {
    createSettings,
    createSettingsFolder,
    createStandardTextFieldKeyHandler,
    declare,
    IKeyEventListener,
    InsertTextCommand,
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
                    const baseHandler = createStandardTextFieldKeyHandler(
                        field,
                        context,
                        {onExit: close}
                    );
                    const handler: IKeyEventListener = event => {
                        const index = event.key.char
                            ? "abcdefghijklmnopqrstuvwxyz".indexOf(event.key.char)
                            : -1;
                        if (index != -1 && ["down", "repeat"].includes(event.type)) {
                            new InsertTextCommand(field, index + "").execute();
                            return true;
                        }

                        return baseHandler(event);
                    };

                    return {
                        field,
                        fieldHandler: handler,
                        onClose,
                    };
                },
                {
                    path: "Example",
                }
            )
        );
    },
});

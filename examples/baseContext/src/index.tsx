import React, {FC, useState, useEffect} from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
    IOContext,
    FillBox,
    ApplicationLayout,
    Box,
    emitContextEvent,
} from "@launchmenu/core";
import {IDataHook} from "model-react";

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

const WaterMarked: FC<{context: IOContext}> = ({context}) => {
    const [key, setKey] = useState(1);

    // Force a refresh after some delay, as this is required for the application layout to properly calculate the menu width (this is a bug)
    useEffect(() => {
        let id = setTimeout(() => setKey(2), 200);
        return () => clearTimeout(id);
    }, []);

    return (
        <FillBox>
            <ApplicationLayout key={key} context={context} />
            <Box
                position="absolute"
                right="none"
                top="none"
                font="header"
                zIndex={100}
                padding="medium">
                Powered by Bob
            </Box>
        </FillBox>
    );
};

export default declare({
    info,
    settings,
    withSession(session) {
        const getSettingsApplet = () =>
            session.getApplets().find(({info}) => info.name.match(/settings/i));

        return {
            open({context, onClose}) {
                const customContext = new IOContext(context);
                const settingsApplet = getSettingsApplet();
                if (!settingsApplet || !settingsApplet.open) return;

                // Hide the content section by default
                customContext.open(
                    new UILayer(
                        {contentView: {close: true}},
                        {
                            // Prevent transparent overlay from showing
                            showNodataOverlay: false,
                        }
                    )
                );

                // Open a new layer in the regular context,  containing our watermarked UI + opened settings + forward key events
                context.open(
                    new UILayer((ctx, close) => {
                        settingsApplet!.open!({
                            context: customContext,
                            onClose: () => {
                                close();
                                onClose();
                            },
                        });

                        return {
                            fieldView: {close: true},
                            menuView: {close: true},
                            contentView: <WaterMarked context={customContext} />,
                            contentHandler: event =>
                                emitContextEvent(customContext, event),
                        };
                    })
                );
            },
        };
    },
});

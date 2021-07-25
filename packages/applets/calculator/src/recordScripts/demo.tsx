import {
    Controller,
    declareVideoScript,
    TitleScreen,
    Visualizer,
} from "@launchmenu/applet-lm-recorder";
import React from "react";
import {Box, Button, FillBox, UILayer} from "@launchmenu/core";
import {settings} from "..";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let destroyFakeAlert = () => {};

        try {
            destroyFakeAlert = setupFakeAlert(visualizer, controller);
            //controller.getSession()?.context.settings.get(settings).username.set("Bob");

            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/demo.webm`);

            // Show items added
            await visualizer.show(
                <TitleScreen
                    title="Search results"
                    list={["Adds search results", "Items display alert on execution"]}
                />,
                {fadeIn: false, duration: 3500} // roughly used formula `#words * 0.35` based on personal testing (being a slow reader)
            );
            await controller.wait(1000);
            await controller.type(["world"]);
            await controller.selectItem(/^hello/im);
            await controller.wait(1000);
            await controller.press("enter");
            await controller.wait(2000);
            await controller.press("enter");
            await controller.wait(1000);

            // Show settings
            await visualizer.show(
                <TitleScreen
                    title="Settings"
                    list={[
                        "Adds settings",
                        "The user name setting is used by search results",
                    ]}
                />,
                {duration: 4000}
            );
            await controller.wait(1000);
            await controller.type([{key: "down", repeat: 2}, {key: "enter"}]);
            await controller.navigate([/^user/im]);
            await controller.type([
                {delay: 500, key: ["ctrl", "a"]},
                {text: "John"},
                {delay: 500, key: "enter"},
                {key: "esc"},
            ]);
            await controller.wait(500);
            await controller.selectItem(/^hello/im);
            await controller.wait(2000);

            // Show menu
            await visualizer.show(
                <TitleScreen
                    title="Open applet"
                    list={[
                        "Adds a menu with all items",
                        "Items are the same as search items",
                    ]}
                />,
                {duration: 5250}
            );
            await controller.wait(1000);
            await controller.type([{key: "down"}, {delay: 1000, key: "enter"}]);
            await controller.type([
                {delay: 1000, key: "down"},
                {delay: 1000, key: "up"},
            ]);
            await controller.wait(1000);

            // Show actions
            await visualizer.show(
                <TitleScreen
                    css={{fontSize: 40}}
                    title="Custom context action"
                    list={[
                        "Action displays alert",
                        "Action can handle multiple items",
                        "Action triggers on shortcut ctrl+g",
                    ]}
                />,
                {duration: 6000}
            );
            await controller.wait(1000);
            await controller.hold(["shift"], {
                whileHeld: async () => {
                    await controller.wait(500);
                    await controller.press("down");
                },
            });
            await controller.wait(500);
            await controller.press("tab");
            await controller.wait(1000);
            await controller.navigate([/alert/im]);
            await controller.wait(3000);
            await controller.press("enter");
            await controller.wait(1000);
            await controller.press(["ctrl", "g"]);
            await controller.wait(2000);
            await controller.press("enter");

            await controller.wait(4000);
            await recording.stop();
        } finally {
            destroyFakeAlert();
        }
    }
);

/**
 * Sets up a fake alert function that doesn't use teh normal alert UI (since that's not visible in screen recordings + freezes UI)
 * @param visualizer The visualizer to use to display the alert
 * @param controller The controller to use to open a key listener for closing of the alert
 * @returns A function to revert the alert override
 */
function setupFakeAlert(visualizer: Visualizer, controller: Controller): () => void {
    (global as any).originalAlert = (global as any).originalAlert || global.alert; // Nvm type safety, this is a hacky thing to begin with (only acceptable because it only affects recordings)

    const myAlert = async (message: string) => {
        const {destroy} = await visualizer.show(
            <FillBox display="flex" justifyContent="center" alignItems="center">
                <Box
                    borderRadius="medium"
                    width={300}
                    padding="large"
                    elevation="large"
                    backgroundColor="bgPrimary">
                    {message}
                    <Box display="flex" justifyContent="flex-end" marginTop="medium">
                        <Button background="primary">Ok</Button>
                    </Box>
                </Box>
            </FillBox>
        );

        controller.getSession()?.context.open(
            new UILayer((context, close) => ({
                contentHandler: event => {
                    if (event.is("enter")) {
                        destroy();
                        close();
                    }
                },
            }))
        );
    };
    global.alert = myAlert;

    return () => {
        if (global.alert == myAlert) {
            global.alert = (global as any).originalAlert;
        }
    };
}

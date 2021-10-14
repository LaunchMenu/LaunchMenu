import {Controller, declareVideoScript, Visualizer} from "@launchmenu/applet-lm-recorder";
import React from "react";
import {Box, Button, FillBox, UILayer} from "@launchmenu/core";
import {settings} from "..";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let destroyFakeAlert = () => {};

        try {
            destroyFakeAlert = setupFakeAlert(visualizer, controller);

            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/demo.webm`);

            await controller.wait(1000);
            await controller.type("hello");
            await controller.wait(1500);
            await controller.press("enter");
            await controller.wait(1500);
            await controller.press("enter");

            await controller.wait(2000);
            await controller.type([
                {key: "esc"},
                {delay: 500, text: "s: username"},
                {delay: 500, key: "enter"},
                {delay: 500, key: ["ctrl", "a"]},
                {text: "John"},
                {delay: 500, key: "enter"},
                {delay: 500, key: ["ctrl", "h"]},
            ]);
            await controller.wait(1000);

            await controller.type("hello");
            await controller.wait(1500);
            await controller.press("enter");
            await controller.wait(1500);
            await controller.press("enter");
            await controller.wait(5000);

            await recording.stop();
        } finally {
            controller.getSession()?.context.settings.get(settings).username.set("Bob");
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

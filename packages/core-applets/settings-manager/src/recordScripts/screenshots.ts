import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        keyVisualizer.setListenerEnabled(false);
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;

        // Banner
        await controller.type("settings");
        await controller.navigate([/^settings manager$/im, /^notes$/im]);
        await recorder.screenshotLM(`${recordings}/banner.png`);
        await controller.hold(["shift", "esc"]);

        // Search pattern
        await controller.type("setting: size");
        await recorder.screenshotLM(`${recordings}/search pattern.png`);
        await controller.press("esc");

        // All settings
        await controller.type(["settings", {key: "enter"}]);
        await recorder.screenshotLM(`${recordings}/allSettings.png`);
    }
);

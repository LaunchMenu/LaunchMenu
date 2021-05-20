import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        keyVisualizer.setListenerEnabled(false);
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;

        // Banner
        await controller.type("hello");
        await controller.wait(500);
        await controller.selectItem(/hello/);
        await controller.press("tab");
        await controller.navigate([/global/i, /session/i]);
        await recorder.screenshotLM(`${recordings}/banner.png`);
        await controller.hold(["shift", "esc"]);

        // Settings
        await controller.type("settings");
        await controller.navigate([/settings manager/i, /session/i]);
        await recorder.screenshotLM(`${recordings}/settings.png`);

        await controller.navigate([/controls/i]);
        await recorder.screenshotLM(`${recordings}/controls.png`);
    }
);

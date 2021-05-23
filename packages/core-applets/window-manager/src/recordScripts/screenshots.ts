import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        keyVisualizer.setListenerEnabled(false);
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;

        // Banner
        await controller.type("setting: position");
        await recorder.screenshotLM(`${recordings}/banner.png`);
        await controller.press("esc");

        // // Context menu
        // await controller.type("hello");
        // await controller.selectItem(/hello/);
        // await controller.press("tab");
        // await controller.navigate([/global/i, /window/i]);
        // await recorder.screenshotLM(`${recordings}/contextMenu.png`);
        // await controller.hold(["shift", "esc"]);

        // Settings
        await controller.type("settings");
        await controller.navigate([/settings manager/i, /window/i]);
        await recorder.screenshotLM(`${recordings}/settings.png`);
        await recorder.screenshotLM(`${recordings}/windowPosition.png`);

        // Window size
        await controller.selectItem(/size/i);
        await recorder.screenshotLM(`${recordings}/windowSize.png`);

        // Visibility
        await controller.navigate([/visibility/i]);
        await recorder.screenshotLM(`${recordings}/visibility.png`);
    }
);

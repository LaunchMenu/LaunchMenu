import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        keyVisualizer.setListenerEnabled(false);
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;

        // Banner
        await controller.type("applet");
        await recorder.screenshotLM(`${recordings}/banner.png`);
        await controller.press("esc");

        // Open
        await controller.type("notes");
        await recorder.screenshotLM(`${recordings}/search.png`);
        await controller.press("esc");

        // Pattern
        await controller.type("applet: notes");
        await recorder.screenshotLM(`${recordings}/searchPattern.png`);
        await controller.press("esc");
    }
);

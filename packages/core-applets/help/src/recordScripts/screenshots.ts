import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        keyVisualizer.setListenerEnabled(false);
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;

        await controller.type([":help", {key: "down"}]);
        await recorder.screenshotLM(`${recordings}/banner.png`);
    }
);

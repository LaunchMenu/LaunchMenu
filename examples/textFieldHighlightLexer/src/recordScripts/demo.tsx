import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("example");
        await controller.wait(500);
        await controller.press("enter");

        await controller.wait(1500);
        await controller.type("12*(5-2)");
        await controller.wait(2500);
        await controller.press("esc");
        await controller.wait(5000);

        await recording.stop();
    }
);

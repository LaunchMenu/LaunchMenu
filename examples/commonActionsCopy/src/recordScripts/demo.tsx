import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("copy");
        await controller.wait(500);
        await controller.navigate([/copy as primary/im]);
        await controller.wait(500);
        await controller.press(["ctrl", "v"]);
        await controller.wait(3000);
        await controller.type([{key: ["ctrl", "a"]}, {text: "copy"}]);
        await controller.wait(500);
        await controller.selectItem(/copy in context/im);
        await controller.wait(500);
        await controller.press("tab");
        await controller.wait(500);
        await controller.navigate([/copy/im]);
        await controller.wait(500);
        await controller.press(["ctrl", "v"]);
        await controller.wait(5000);

        await recording.stop();
    }
);

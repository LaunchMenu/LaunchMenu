import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("not people");
        await controller.wait(2500);
        await controller.type([{key: "home"}, {key: "delete", repeat: 4}]);
        await controller.wait(5000);

        await recording.stop();
    }
);

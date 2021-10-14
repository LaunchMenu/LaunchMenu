import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("example");
        await controller.wait(500);
        await controller.type([{key: "enter", repeat: 3, repeatDelay: 3000}]);
        await controller.wait(3500);
        await controller.press("down");
        await controller.wait(500);
        await controller.type([{key: "enter", repeat: 2, repeatDelay: 3000}]);
        await controller.wait(3500);

        await controller.type([{key: ["ctrl", "z"], repeat: 4, repeatDelay: 3000}]);
        await controller.wait(3500);
        await controller.type([{key: ["ctrl", "y"], repeat: 4, repeatDelay: 3000}]);
        await controller.wait(5000);

        await recording.stop();
    }
);

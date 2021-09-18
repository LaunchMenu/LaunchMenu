import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("example");
        await controller.wait(500);
        await controller.type([{key: "enter", repeat: 6}]);
        await controller.wait(500);
        await controller.press("down");
        await controller.wait(500);
        await controller.type([{key: "enter", repeat: 3}]);
        await controller.wait(500);
        await controller.press("down");
        await controller.wait(500);
        await controller.type([{key: "enter", repeat: 2}]);
        await controller.wait(2000);

        await controller.type([{key: ["ctrl", "z"], repeat: 6, repeatDelay: 300}]);
        await controller.wait(1500);
        await controller.type([{key: ["ctrl", "y"], repeat: 5, repeatDelay: 300}]);
        await controller.wait(5000);

        await recording.stop();
    }
);

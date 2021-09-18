import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();

        const recordings = `${__dirname}/../../recordings`;
        const recording = await recorder.recordLM(`${recordings}/demo.webm`);

        await controller.wait(1000);
        await controller.type("example");
        await controller.navigate([/example/im]);
        await controller.wait(1000);
        await controller.press("down");
        await controller.wait(500);
        await controller.hold(["shift"], {
            whileHeld: async () => {
                await controller.type([{key: "down", repeat: 3}]);
            },
        });
        await controller.wait(1000);
        await controller.press("enter");

        await controller.wait(5000);

        await recording.stop();
    }
);

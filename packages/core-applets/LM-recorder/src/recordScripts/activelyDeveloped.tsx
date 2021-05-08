import {declareVideoScript} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);
        try {
            await controller.resetLM();

            // Go to the final state of the introduction
            keyVisualizer.setListenerEnabled(false);
            await controller.type("disambigoat");
            await controller.wait(1000);
            await controller.selectItem(/disambiguation/);
            keyVisualizer.setListenerEnabled(true);

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/activelyDeveloped.webm`
            );

            await controller.wait(1000);
            await controller.type([{key: "esc"}, {delay: 500, text: "developed"}]);

            await controller.wait(15000);

            await recording.stop();
        } finally {
            await restore();
        }
    }
);

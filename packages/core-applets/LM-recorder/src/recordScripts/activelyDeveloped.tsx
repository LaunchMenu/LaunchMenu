import {declareVideoScript} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/activelyDeveloped.webm`
            );

            await controller.wait(1000);
            await controller.type("developed");

            await controller.wait(15000);

            await recording.stop();
        } finally {
            await restore();
        }
    }
);

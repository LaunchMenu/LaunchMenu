import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "@launchmenu/applet-notes/build/recordScripts/setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/resetSession.webm`);

            await controller.wait(1000);
            await controller.type("hello");
            await controller.wait(500);
            await controller.selectItem(/hello/);
            await controller.wait(500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.navigate([/definitions/i]);
            await controller.wait(500);
            await controller.type("greet");
            await controller.wait(3000);
            await controller.hold(["shift", "esc"]);
            await controller.wait(2000);

            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

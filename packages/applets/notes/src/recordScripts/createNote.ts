import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "./setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/createNote.webm`);

            await controller.wait(500);
            await controller.type("notes");
            await controller.selectItem(/^Notes$/m);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.selectItem(/Add note/m);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.type([
                "Food",
                {delay: 1000, key: "enter"},
                {delay: 500, text: "- Oranges \n- Potatoes"},
                {delay: 500, key: "esc"},
            ]);

            await controller.wait(3001);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

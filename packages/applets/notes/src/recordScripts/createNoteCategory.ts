import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "./setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/createNoteCategory.webm`
            );
            await controller.wait(500);
            await controller.type("notes");
            await controller.selectItem(/^Notes$/m);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.selectItem(/Add category/m);
            await controller.wait(500);
            await controller.type([
                {key: "enter"},
                {delay: 500, text: "Food"},
                {delay: 500, key: "enter"},
                {delay: 1500, key: "enter"},
                {delay: 500, text: "Potato"},
                {delay: 500, key: "enter"},
                {delay: 500, text: "Delicious"},
                {delay: 500, key: "esc"},
            ]);

            await controller.wait(4000);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

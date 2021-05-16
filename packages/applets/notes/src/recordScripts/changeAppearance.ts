import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "./setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            keyVisualizer.setListenerEnabled(false);
            await controller.type("notes");
            await controller.selectItem(/^Notes$/m);
            await controller.press("enter");
            await controller.selectItem(/Add note/m);
            await controller.press("enter");
            await controller.type([
                "Food",
                {key: "enter"},
                {text: "- Oranges \n- Potatoes"},
                {key: "esc"},
            ]);
            keyVisualizer.setListenerEnabled(true);

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/changeAppearance.webm`
            );

            await controller.wait(1500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.navigate([/^edit styling$/im, /^set syntax mode$/im]);
            await controller.wait(1000);
            await controller.type(["markdown", {delay: 1000, key: "enter"}]);

            await controller.wait(4000);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

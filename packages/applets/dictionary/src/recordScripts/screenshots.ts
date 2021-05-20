import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "@launchmenu/applet-notes/build/recordScripts/setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            keyVisualizer.setListenerEnabled(false);
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;

            await controller.type("onomotop");
            await controller.selectItem(/^onomatopoeia$/m);
            await recorder.screenshotLM(`${recordings}/search.png`);

            await controller.press("esc");
            await controller.type("define: peanut");
            await controller.selectItem(/^peanut$/m);
            await recorder.screenshotLM(`${recordings}/patternSearch.png`);
        } finally {
            restoreNotes();
        }
    }
);

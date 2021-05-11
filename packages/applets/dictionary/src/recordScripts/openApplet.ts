import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "@launchmenu/applet-notes/build/recordScripts/setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/openApplet.webm`);

            await controller.wait(1000);
            await controller.type(["dictionary", {delay: 500, key: "enter"}]);
            await controller.wait(1000);
            await controller.type("fansy");
            await controller.wait(500);
            await controller.selectItem(/^fancy$/m);
            await controller.wait(500);
            await controller.type([{key: "pageDown", repeat: 12}]);

            await controller.wait(7000);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

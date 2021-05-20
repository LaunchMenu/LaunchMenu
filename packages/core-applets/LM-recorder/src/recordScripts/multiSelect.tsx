import {KeyEvent} from "@launchmenu/core";
import {declareVideoScript, showHighlightRect} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);

        try {
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/multiSelect.webm`);
            await controller.wait(1000);

            await controller.type("bob");
            await controller.wait(1000);

            recording.tagTime("select.start");
            await controller.wait(500);
            await controller.press(
                new KeyEvent({key: {id: "shiftLeft", name: "shift"}, type: "down"})
            );
            await controller.press("down");
            await controller.press(
                new KeyEvent({key: {id: "shiftLeft", name: "shift"}, type: "up"})
            );
            // TODO: find a better way to not hard-code these coords
            await showHighlightRect(visualizer, {
                area: {x: 18, y: 115, width: 8, height: 79},
                duration: 2500,
                comment: "Selection highlight",
            });
            await controller.wait(1000);
            await controller.press("enter");
            await controller.wait(500);
            recording.tagTime("select.end");

            await controller.wait(4500);
            await controller.press("esc");
            await controller.wait(500);

            recording.tagTime("menu.start");
            await controller.wait(500);
            await controller.press("down");
            // TODO: find a better way to not hard-code these coords
            await showHighlightRect(visualizer, {
                area: {x: 18, y: 115, width: 265, height: 180},
                duration: 3500,
                comment: "Selection includes the cursor",
            });
            await controller.wait(500);
            await controller.press("tab");
            await controller.selectItem(/loud/i);
            await controller.wait(2000);
            await controller.type([{key: "enter"}]);
            await controller.wait(500);
            recording.tagTime("menu.end");

            await controller.wait(4500);
            await controller.press("esc");
            await controller.wait(3500);

            await recording.stop();
            await recording.saveTimestamps();
        } finally {
            await restore();
        }
    }
);

import {declareVideoScript, showHighlightRect} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);

        try {
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/contextMenus.webm`);
            await controller.wait(1000);

            await controller.type(["notes", {delay: 1000, key: "enter"}]);
            await controller.wait(1000);

            recording.tagTime("itemActions.start");
            await controller.wait(1000);
            await controller.type([
                {key: "enter"},
                {delay: 1000, text: "VIM-like:"},
                {key: "enter"},
            ]);
            await controller.wait(500);
            recording.tagTime("itemActions.end");

            await controller.wait(2500);
            await controller.type([{key: "esc"}]);
            await controller.wait(1500);

            recording.tagTime("contextMenu.start");
            await controller.wait(500);
            await controller.type([{key: "tab"}]);
            await controller.wait(500);
            recording.tagTime("contextMenu.end");

            await controller.wait(3500);

            recording.tagTime("search.start");
            await controller.wait(500);
            await controller.type([{text: "styl"}]);
            await controller.wait(500);
            recording.tagTime("search.end");

            await controller.wait(3500);

            recording.tagTime("subMenus.start");
            await controller.wait(500);
            await controller.type([{key: "enter"}]);
            await controller.wait(500);
            recording.tagTime("subMenus.end");

            await controller.wait(3500);

            recording.tagTime("path.start");
            await controller.wait(500);
            const rectPromise = showHighlightRect(visualizer, {
                area: "path",
                visible: ["content", "menu", "path", "textField"],
                duration: 3500,
            });
            await controller.wait(1500);
            recording.tagTime("path.end");
            await rectPromise;

            await controller.wait(1000);
            await controller.type([{key: "esc", repeat: 5, repeatDelay: 200}]);
            await controller.wait(3500);

            await recording.stop();
            await recording.saveTimestamps();
        } finally {
            await restore();
        }
    }
);

import {declareVideoScript} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);

        try {
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/searchAnywhere.webm`
            );
            await controller.wait(1000);

            await controller.type("fancy");
            await controller.selectItem(/fancy$/m);
            await controller.type([{delay: 500, key: "tab"}]);
            await controller.selectItem(/definitions/i);
            await controller.type([{delay: 500, key: "enter"}]);
            await controller.selectItem(/^verb/i);
            await controller.type([{delay: 500, key: "enter"}]);

            await controller.wait(500);
            recording.tagTime("allMenus.start");
            await controller.wait(500);
            await controller.type("like");
            await controller.wait(1000);
            recording.tagTime("allMenus.end");

            await controller.wait(3500);
            await controller.type([{key: "esc", repeat: 3, repeatDelay: 200}]);
            await controller.wait(500);

            await controller.selectItem(/global/i);
            await controller.type([{delay: 500, key: "enter"}]);
            await controller.selectItem(/settings/i);
            await controller.type([{delay: 500, key: "enter"}]);
            await controller.selectItem(/all/i);
            await controller.type([{delay: 500, key: "enter"}]);

            await controller.wait(500);
            recording.tagTime("recursive.start");
            await controller.wait(500);
            await controller.type("window");
            await controller.wait(1000);
            recording.tagTime("recursive.end");

            await controller.wait(3500);
            await controller.type([{key: ["shift", "esc"]}]);
            await controller.wait(500);

            recording.tagTime("pattern.start");
            await controller.wait(500);
            await controller.type("setting: word");
            await controller.wait(2500);
            await controller.type([{key: "esc"}, {text: "define: word"}]);
            await controller.wait(1000);
            recording.tagTime("pattern.end");

            await controller.wait(3500);
            await controller.type([{key: "esc"}]);
            await controller.wait(500);

            recording.tagTime("fuzzy.start");
            await controller.wait(500);
            await controller.type("onomotop");
            await controller.wait(1000);
            recording.tagTime("fuzzy.end");

            await controller.wait(3500);
            await controller.type([{key: "esc"}]);
            await controller.wait(500);

            recording.tagTime("prioritized.start");
            await controller.wait(500);
            await controller.type("prioritized");
            await controller.wait(1000);
            recording.tagTime("prioritized.end");

            await controller.wait(8000);

            await recording.stop();
            await recording.saveTimestamps();
        } finally {
            await restore();
        }
    }
);

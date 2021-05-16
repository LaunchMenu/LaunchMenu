import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "@launchmenu/applet-notes/build/recordScripts/setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/manageSessions.webm`
            );

            // Search for hello and create new session
            await controller.wait(1000);
            await controller.type("hello");
            await controller.wait(500);
            await controller.selectItem(/hello/i);
            await controller.wait(500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.navigate([/global/i, /session/i]);
            await controller.wait(3000);
            await controller.navigate([/add/i]);
            await controller.wait(2000);

            // Search for physics and create new session
            await controller.wait(1000);
            await controller.type("physics");
            await controller.selectItem(/physics cheat/i);
            await controller.wait(2000);
            await controller.press(["ctrl", "n"]);

            // Search for todo
            await controller.wait(1000);
            await controller.type("todo");
            await controller.selectItem(/todo/i);

            // Check sessions in manager
            await controller.wait(1500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.navigate([/global/i, /session/i]);
            await controller.type([
                {key: "down", delay: 2000, repeat: 2, repeatDelay: 2000},
                {key: "up", delay: 2000, repeat: 2},
            ]);
            await controller.wait(1500);
            await controller.press("enter");

            // Toggle session
            await controller.wait(2500);
            await controller.press(["ctrl", "r"]);
            await controller.wait(1500);
            await controller.press(["ctrl", "r"]);

            // Delete session
            await controller.wait(1500);
            await controller.press(["ctrl", "w"]);
            await controller.press("down");
            await controller.wait(1500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.selectItem(/delete/i);
            await controller.wait(1500);
            await controller.press("enter");

            await controller.wait(4000);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

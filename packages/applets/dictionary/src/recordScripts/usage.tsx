import React from "react";
import {declareVideoScript, showRemoteTitleScreen} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "@launchmenu/applet-notes/build/recordScripts/setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            // Site: https://tlk.io/dictionary
            await visualizer.setScreenOverlaysEnabled(true);
            await visualizer.setScreenOverlayRect({x: -400, y: -400});
            await keyVisualizer.setFullScreenMode(true);
            await controller.resetLM();

            await controller.waitOpen(false);
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordScreen(`${recordings}/usage.webm`, {
                displayPoint: {x: -400, y: -400},
            });
            await showRemoteTitleScreen(visualizer, {
                props: {title: "Dictionary", description: "Powered by Wiktionary"},
                duration: 3000,
                fadeIn: false,
                hideCursor: true,
            });

            await controller.waitOpen(true);
            await keyVisualizer.showKeyText(["meta", "space"], {duration: 1000});
            await controller.type("fancy");
            await controller.wait(1000);
            await controller.press("tab");
            await controller.wait(500);
            await controller.selectItem(/definitions/i);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.type("like");
            await controller.wait(3000);
            await controller.press(["ctrl", "q"]);

            await controller.waitOpen(true);
            await keyVisualizer.showKeyText(["meta", "space"], {duration: 1000});
            await controller.type("i'm good");
            await controller.wait(5000);
            await controller.press(["ctrl", "q"]);

            await controller.wait(4000);
            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

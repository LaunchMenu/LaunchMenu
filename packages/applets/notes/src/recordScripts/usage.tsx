import React from "react";
import {declareVideoScript, showRemoteTitleScreen} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "./setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            // Site: https://tlk.io/physics
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
                props: {title: "Notes"},
                duration: 3000,
                fadeIn: false,
                hideCursor: true,
            });

            /* msg: Do you know the formula for kinetic energy? */
            await controller.waitOpen(true);
            await keyVisualizer.showKeyText(["meta", "space"], {duration: 1000});
            await controller.wait(500);
            await controller.type("physics");
            await controller.selectItem(/^physics cheat sheet$/im);
            await controller.wait(500);
            await controller.press("pageDown");
            await controller.wait(2500);
            await controller.press(["ctrl", "q"]);
            /* -msg: Yup, it's 0.5mv^2 */

            await controller.waitOpen(true);
            await keyVisualizer.showKeyText(["meta", "space"], {duration: 1000});
            await controller.type("todo");
            await controller.selectItem(/^todo$/im);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.type([
                {key: "down"},
                {key: "end"},
                {key: "enter"},
                {text: "- study for the physics exam"},
                {delay: 500, key: "esc"},
            ]);
            await controller.wait(2000);
            await controller.press(["ctrl", "q"]);

            await controller.wait(5001);

            await recording.stop();
        } finally {
            restoreNotes();
        }
    }
);

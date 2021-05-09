import React from "react";
import {showHighlightRect, declareVideoScript, NoteScreen} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM, false);
        try {
            keyVisualizer.setListenerEnabled(false);
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            await recorder.screenshotLM(`${recordings}/home.png`);
            const recording = await recorder.recordLM(`${recordings}/introduction.webm`);

            await controller.wait(4000);
            await visualizer.show(
                <NoteScreen> Open LaunchMenu using windows/command + space </NoteScreen>,
                {duration: 4000}
            );
            await controller.wait(500);

            await showHighlightRect(visualizer, {
                area: "textField",
                comment: "Enter your query in the text field to get started",
                duration: 4000,
            });

            await controller.wait(500);
            await controller.type("disambigoat");
            await controller.wait(1000);
            keyVisualizer.setListenerEnabled(true);

            await showHighlightRect(visualizer, {
                area: "menu",
                comment: "Navigate the results in the menu section",
                duration: 6000,
            });

            await controller.selectItem(/disambiguation/);
            await controller.wait(3000);

            await showHighlightRect(visualizer, {
                area: "content",
                comment: "Read the result in the content section",
                duration: 6000,
            });
            await controller.wait(2000);

            await recording.stop();
        } finally {
            await restore();
        }
    }
);

import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {setupStandardNotes} from "./setupStandardNotes";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restoreNotes = await setupStandardNotes(LM);
        try {
            await controller.resetLM();
            keyVisualizer.setListenerEnabled(false);
            const recordings = `${__dirname}/../../recordings`;

            /* Settings */
            // Overview
            await controller.type("settings");
            await controller.navigate([/^Settings manager$/im, /Notes/im]);
            await recorder.screenshotLM(`${recordings}/settingsOverview.png`);

            // Defaults
            await controller.navigate([/defaults/im]);
            await recorder.screenshotLM(`${recordings}/settingsDefaults.png`);
            await controller.press("esc");

            // Editing
            await controller.navigate([/editor/im]);
            await recorder.screenshotLM(`${recordings}/settingsEditing.png`);
            await controller.press("esc");

            // Inline categories
            await controller.navigate([/inline/im]);
            await controller.type("true");
            await controller.press("enter");
            await controller.hold(["shift", "esc"]);

            await controller.type("notes");
            await controller.navigate([/^Notes$/m]);
            await recorder.screenshotLM(`${recordings}/settingsInlineCategories.png`);

            await controller.hold(["shift", "esc"]);
            await controller.type("s: inline categories");
            await controller.navigate([/inline/im]);
            await controller.type("false");
            await controller.press("enter");
            await controller.hold(["shift", "esc"]);

            /* Usage */
            // Banner
            await controller.type("notes");
            await controller.navigate([/^Notes$/m]);
            await recorder.screenshotLM(`${recordings}/banner.png`);

            // Search pattern
            await controller.hold(["shift", "esc"]);
            await controller.type("note: physics");
            await controller.selectItem(/physics/im);
            await recorder.screenshotLM(`${recordings}/searchPattern.png`);

            // Syntax highlighting
            await controller.hold(["shift", "esc"]);
            await controller.type("notes");
            await controller.navigate([/^Notes$/m, /Add note/m]);
            await controller.type([
                "javascript example",
                {key: "enter"},
                {text: "for (let i = 0; i < 10; i++) console.log(i);"},
                {key: "esc"},
            ]);
            await controller.press("tab");
            await controller.navigate([/^edit styling$/im, /^set syntax mode$/im]);
            await controller.type(["javascript", {key: "enter"}]);
            await recorder.screenshotLM(`${recordings}/syntaxMode.png`);
            await controller.press("tab");
            await controller.navigate([/^delete$/im]);

            /* Content styling options */
            // Searchable content
            await controller.selectItem(/algebra/im);
            await controller.type([
                {key: "tab"},
                "search",
                {key: "enter"},
                {key: ["ctrl", "a"]},
                "true",
                {key: "enter"},
            ]);
            await controller.type("matrix");
            await recorder.screenshotLM(`${recordings}/searchableContent.png`);
            await controller.press("esc");

            // Rich content
            await controller.selectItem(/physics/im);
            await recorder.screenshotLM(`${recordings}/richContentMarkdown.png`);

            await controller.navigate([/Add note/m]);
            await controller.type([
                "plain text",
                {key: "enter"},
                {text: "potatoes"},
                {key: "esc"},
            ]);
            await recorder.screenshotLM(`${recordings}/richContentText.png`);
            await controller.press("tab");
            await controller.navigate([/^delete$/im]);

            await controller.selectItem(/temperature/im);
            await recorder.screenshotLM(`${recordings}/richContentHtml.png`);

            // Font size
            await controller.selectItem(/todo/im);
            await controller.type([
                {key: "tab"},
                "font size",
                {key: "enter"},
                {key: ["ctrl", "a"]},
                "30",
                {key: "enter"},
            ]);
            await recorder.screenshotLM(`${recordings}/fontSize.png`);

            // Color
            await controller.selectItem(/physics/im);
            await controller.type([
                {key: "tab"},
                "color",
                {key: "enter"},
                {key: ["ctrl", "a"]},
                "#f00",
                {key: "enter"},
                {key: "up"},
            ]);
            await recorder.screenshotLM(`${recordings}/color.png`);

            //
        } finally {
            restoreNotes();
        }
    }
);

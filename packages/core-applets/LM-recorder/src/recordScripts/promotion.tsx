import {declareVideoScript} from "../applet";
import {clipboard} from "electron";
import type {setupNotes} from "@launchmenu/applet-notes/build/recordScripts/setupNotes";
import {FillBox} from "@launchmenu/core";
import React from "react";

// The recording used within the promotional video
export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await (
            require("@launchmenu/applet-notes/build/recordScripts/setupNotes")
                .setupNotes as typeof setupNotes
        )({
            LM,
            ...notes,
        });

        const bodyEl = document.querySelector("body");
        try {
            await controller.resetLM();
            if (bodyEl) bodyEl.style.background = "white";
            clipboard.writeText(
                "I:\\projects\\Github\\LaunchMenu\\packages\\core-applets\\LM-recorder\\images\\success.gif"
            );

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/promotion demo.webm`,
                {padding: {x: 0, y: 0}}
            );

            const startTime = controller.wait(1500);
            const contextMenuTime = controller.wait(33200);
            const searchTime = controller.wait(47500);

            await startTime;
            await controller.type("notes");
            await controller.wait(500);
            await controller.navigate([/notes/im]);
            await controller.wait(500);
            await controller.navigate([/note/im], {keyDelay: 400});
            await controller.wait(500);
            await controller.type([{text: "Tasks"}, {delay: 500, key: "enter"}]);
            await controller.wait(500);
            await controller.type([
                {text: "Demonstrate LM capabilities\n"},
                {delay: 500, text: "\n"},
                {delay: 300, text: "![Cool]("},
                {delay: 500, key: ["ctrl", "v"]},
                {delay: 500, text: ")"},
                {delay: 500, key: "esc"},
            ]);

            await controller.wait(1000);
            await controller.navigate([/category/im], {keyDelay: 400});
            await controller.wait(500);
            await controller.type([{text: "LaunchMenu"}, {delay: 500, key: "enter"}]);

            await contextMenuTime;
            await controller.selectItem(/task/im);
            await controller.wait(500);
            await controller.press("shift");
            await controller.wait(500);
            await controller.selectItem(/finish/im);
            await controller.wait(500);
            await controller.press("shift");
            await controller.wait(500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.selectItem(/category/im);
            await controller.wait(500);
            await controller.press("enter");
            await controller.wait(500);
            await controller.type([
                {key: "up"},
                {delay: 500, key: "enter"},
                {delay: 500, key: "esc"},
            ]);

            await searchTime;
            await controller.selectItem(/task/im);
            await controller.wait(500);
            await controller.type([
                {key: "tab"},
                {delay: 500, text: "syntax"},
                {delay: 1000, key: "enter"},
                {delay: 500, text: "markdown"},
                {delay: 500, key: "enter"},
            ]);

            await controller.wait(4500);

            await controller.press(["ctrl", "h"]);
            await controller.wait(500);
            await controller.type("efficiency");
            await controller.wait(2000);
            await controller.press("down");
            await controller.wait(5000);

            await recording.stop();
        } finally {
            if (bodyEl) bodyEl.style.background = "";
            await restore();
        }
    }
);

// The notes to to be present in LM
const notes: Omit<Parameters<typeof setupNotes>[0], "LM"> = {
    notes: [
        {
            name: "Finish up LM",
            content: `- Finish blocking LM bugs\n- Make promotional website up to date\n- Create independent promotional video`,
            syntaxMode: "markdown",
        },
        {
            name: "Built-in TS transformers",
            content: `type A = Parameters<Func>; // [number, string]\ntype B = ReturnType<Func>; // string\ntype C = Omit<Obj, "a">; // {b: string, c?: boolean}\ntype D = Pick<Obj, "a">; // {a: number}\ntype E = Record<string, boolean>; // {[x: string]: boolean}\ntype F = Required<Obj>; // {a: number, b: string, c: boolean};\ntype G = Partial<Obj>; // {a?: number, b?: string, c: boolean};`,
            syntaxMode: "typescript",
            fontSize: 10,
        },
    ],
    categories: [],
};

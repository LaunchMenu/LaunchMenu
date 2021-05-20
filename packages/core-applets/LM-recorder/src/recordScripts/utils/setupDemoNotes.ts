import {LaunchMenu} from "@launchmenu/core";
import Path from "path";
import type {setupNotes} from "@launchmenu/applet-notes/build/recordScripts/setupNotes";

/**
 * Sets up the notes to be shown in the demo recordings of LM
 * @param LM The LM instance to setup the notes for
 */
export function setupDemoNotes(LM: LaunchMenu): Promise<() => Promise<void>> {
    const imageDir = Path.join(__dirname, "..", "..", "..", "images");
    return (require("@launchmenu/applet-notes/build/recordScripts/setupNotes")
        .setupNotes as typeof setupNotes)({
        LM,
        notes: [
            {
                name: "Keyboard modes",
                content: `![hjkl navigation](${imageDir}/hjklNavigation.jpg)`,
                syntaxMode: "markdown",
            },
            {
                name: "Prioritized searches",
                content: `![AI gif](${imageDir}/AI.gif)`,
                syntaxMode: "markdown",
            },
            {
                name: "Actively developed",
                content: `![Development](${imageDir}/development.gif)`,
                syntaxMode: "markdown",
            },
            {
                name: "Mnemonics",
                content: `![Mnemonics](${imageDir}/mnemonics.png)`,
                syntaxMode: "markdown",
            },
            {
                name: "Export",
                content: JSON.stringify(
                    {
                        version: "0.0.0",
                        data: {
                            language: "English",
                        },
                    },
                    null,
                    4
                ),
                syntaxMode: "json",
            },
        ],
        categories: [],
    });
}

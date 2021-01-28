import {createAction} from "../../../createAction";
import {clipboard} from "electron";
import {copyClipboardHandler} from "./copyClipboardHandler";

/** A copy handler to copy text to the electron clipboard */
export const copyTextHandler = createAction({
    name: "Copy text",
    parents: [copyClipboardHandler],
    core: (texts: string[]) => {
        const text = texts.join(",\n");
        return {
            children: [copyClipboardHandler.createBinding({text})],
            result: {
                /** Retrieves the text to be copied */
                getText: () => text,
                /** Copies the text to the clipboard  */
                copyText: () => clipboard.writeText(text),
            },
        };
    },
});

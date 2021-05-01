import {createStandardMenuItem} from "@launchmenu/core";
import {guideAudioRecording} from "./guideAudioRecording";

/** Creates a new menu item used for recording audio */
export function createRecorderItem() {
    return createStandardMenuItem({
        name: "Record audio",
        onExecute: guideAudioRecording,
    });
}

import {createStandardMenuItem} from "@launchmenu/core";
import {guideAudioRecording} from "./guideAudioRecording";

/**
 * Creates a new menu item used for recording audio
 * @returns The audio recorder item
 */
export function createAudioRecorderItem() {
    return createStandardMenuItem({
        name: "Record audio",
        onExecute: guideAudioRecording,
    });
}

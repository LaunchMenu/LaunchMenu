import {IIOContext} from "@launchmenu/core";
import {recordAudio} from "./recordAudio";
import {reviewAudio} from "./reviewAudio";
import {saveAudio} from "./saveAudio";

/**
 * Goes through the audio recording and saving UI
 * @param data The contextual data to be used
 */
export async function guideAudioRecording({
    context,
}: {
    context: IIOContext;
}): Promise<void> {
    let recording = true;
    while (recording) {
        const audio = await recordAudio(context);
        if (!audio) return;

        const {save, rerecord} = await reviewAudio(context, audio);
        recording = rerecord ?? false;

        if (save) {
            await saveAudio(context, audio);
            return;
        }
    }
}

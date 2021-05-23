import {LaunchMenu, wait} from "@launchmenu/core";
import {Field, IDataHook} from "model-react";
import {Controller} from "./controller/Controller";
import {setupOverlayFrame} from "./overlays/setupOverlayFrame";
import {setupOverlayWindow} from "./overlays/setupOverlayWindow";
import {Visualizer} from "./overlays/Visualizer";
import {IRemoteElement} from "./overlays/window/_types/IRemoteElement";
import {KeyVisualizer} from "./keyVisualizer/KeyVisualizer";
import {Recorder} from "./recorder/Recorder";
import {IRecordScript} from "./_types/IRecordScript";

/**
 * Starts sequencing of the given recording script
 * @param config The config for the recording
 * @param LM The LaunchMenu instance to use
 * @returns A promise that resolves once recording is done
 */
export async function recordScript({
    script,
    LM,
}: {
    script: IRecordScript;
    LM: LaunchMenu;
}): Promise<{forceQuit: () => void; finished: Promise<void>}> {
    const quit = new Field(false);
    const hasQuit = (hook: IDataHook) => quit.get(hook);

    // Initialize the overlays
    const overlays = new Field<JSX.Element[]>([]);
    const screenOverlays = new Field<IRemoteElement[]>([]);

    // Setup the overlay window and frame overlays
    const disposeOverlayWindow = new Field<Promise<() => void> | null>(null);
    const enableScreenOverlays = async (enabled: boolean, showDebug?: boolean) => {
        const isEnabled = !!disposeOverlayWindow.get();
        if (isEnabled != enabled) {
            if (!enabled) {
                disposeOverlayWindow.get()?.then(disp => disp());
                disposeOverlayWindow.set(null);
            } else {
                const promise = setupOverlayWindow({
                    overlays: h => screenOverlays.get(h),
                    state: h => visualizer.getScreenOverlayState(h),
                    themePath: h => visualizer.getScreenOverlayThemePath(h),
                    windowBox: h => visualizer.getScreenOverlayRect(h),
                    cursorVisible: h => visualizer.isCursorVisible(h),
                    showDebug,
                });
                disposeOverlayWindow.set(promise);
                await promise;
            }
        }
    };
    const screenOverlaysEnabled = (hook?: IDataHook) => !!disposeOverlayWindow.get(hook);

    const disposeFrame = setupOverlayFrame(LM, h => overlays.get(h));
    await wait(500);

    // Setup all the components that the script can use
    const visualizer = new Visualizer({
        overlays,
        screenOverlays,
        enableScreenOverlays,
        screenOverlaysEnabled,
        hasQuit,
    });
    const keyVisualizer = new KeyVisualizer({LM, overlays, screenOverlays, hasQuit});
    const controller = new Controller({
        LM,
        hasQuit,
    });
    const recorder = new Recorder({hasQuit});

    keyVisualizer.setListenerEnabled(true);
    const scriptingData = {
        visualizer,
        keyVisualizer,
        controller,
        recorder,
        LM,
    };

    // Create disposer for all created data
    const dispose = () => {
        if (quit.get()) return;
        disposeFrame();
        disposeOverlayWindow.get()?.then(disp => disp());
        keyVisualizer.setListenerEnabled(false);
        recorder.cancel();
        quit.set(true);
    };

    // Start recording and return some controls
    const finished = (async () => {
        try {
            await script(scriptingData);
        } finally {
            // Perform the final cleanup
            dispose();
        }
    })();
    return {
        forceQuit: dispose,
        finished,
    };
}

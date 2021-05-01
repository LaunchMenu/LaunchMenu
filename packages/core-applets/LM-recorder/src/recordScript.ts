import {LaunchMenu, wait} from "@launchmenu/core";
import {Field, IDataHook} from "model-react";
import {Controller} from "./controller/Controller";
import {setupOverlayFrame} from "./overlays/setupOverlayFrame";
import {setupOverlayWindow} from "./overlays/setupOverlayWindow";
import {IRemoteElement} from "./overlays/window/_types/IRemoteElement";
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
    // Initialize the overlays
    const overlays = new Field<JSX.Element[]>([]);
    const screenOverlays = new Field<IRemoteElement[]>([]);

    // Setup screen overlay
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
                    state: h => controller.getScreenOverlayState(h),
                    themePath: h => controller.getScreenOverlayThemePath(h),
                    windowBox: h => controller.getScreenOverlayRect(h),
                    cursorVisible: h => controller.isCursorVisible(h),
                    showDebug,
                });
                disposeOverlayWindow.set(promise);
                await promise;
            }
        }
    };
    const screenOverlaysEnabled = (hook?: IDataHook) => !!disposeOverlayWindow.get(hook);

    // Setup the frame for the overlays
    const disposeFrame = setupOverlayFrame(LM, h => overlays.get(h));
    await wait(500);

    // Create the controller
    const quit = new Field(false);
    const controller = new Controller({
        overlays,
        screenOverlays,
        enableScreenOverlays,
        screenOverlaysEnabled,
        LM,
        quit: h => quit.get(h),
    });

    // Execute the script
    const dispose = () => {
        if (quit.get()) return;
        disposeFrame();
        disposeOverlayWindow.get()?.then(disp => disp());
        controller.keyVisualizer.setListenerEnabled(false);
        controller.recorder.cancel();
        quit.set(true);
    };

    return {
        forceQuit: dispose,
        finished: (async () => {
            try {
                await script(controller);
            } finally {
                // Perform the final cleanup
                dispose();
            }
        })(),
    };
}

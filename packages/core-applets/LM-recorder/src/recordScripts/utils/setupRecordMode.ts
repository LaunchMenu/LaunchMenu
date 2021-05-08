import {LaunchMenu} from "@launchmenu/core";
import {setupDemoNotes} from "./setupDemoNotes";
import {setupApplet} from "./setupApplet";
import {alertApplet} from "./alertApplet";
import rickAndMortyApplet from "./rickAndMortyApplet";

/**
 * Sets up a fake applet and proper notes in LM in order to be recorded
 * @param LM The LM instance to Setup
 * @param includeRickAndMorty Whether to include the rick and morty applet, defaults to false
 * @returns A function that can be invoked to revert the changes after recording
 */
export async function setupRecordMode(
    LM: LaunchMenu,
    includeRickAndMorty: boolean = false
): Promise<() => Promise<void>> {
    const revertDemoNotes = await setupDemoNotes(LM);
    const revertFakeAlertApplet = setupApplet(LM, alertApplet);
    const revertFakeRickAndMortyApplet = includeRickAndMorty
        ? setupApplet(LM, rickAndMortyApplet)
        : () => {};
    return async () => {
        revertFakeAlertApplet();
        revertFakeRickAndMortyApplet();
        await revertDemoNotes();
    };
}

import {LaunchMenu} from "@launchmenu/core";
import {setupNotes} from "./setupNotes";

/**
 * Sets up the standard notes to be displayed
 * @param LM The LaunchMenu instance to retrieve data from
 * @returns A function that can be invoked to restore the previous notes
 */
export async function setupStandardNotes(LM: LaunchMenu): Promise<() => Promise<void>> {
    return setupNotes({
        LM,
        notes: [],
        categories: [],
    });
}

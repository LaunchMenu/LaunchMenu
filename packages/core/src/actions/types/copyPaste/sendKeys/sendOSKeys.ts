import {IKeyMatcher} from "../../../../keyHandler/keyIdentifiers/keys";
import {sendWindowsKeys} from "./windows/sendWindowsKeys";
import {sendMacKeys} from "./mac/sendMacKeys";
import {ISendKey} from "./_types/ISendKey";

/**
 * Sends the given key presses to the OS
 * @param keys The keys to be send
 */
export async function sendOSKeys(keys: (IKeyMatcher | ISendKey)[]): Promise<void> {
    /** Normalize the key input */
    const normalizedKeys = keys.map(key =>
        typeof key == "string" ? {key, modifiers: []} : key
    );

    // Send the normalized key press using an appropriate system depending on OS
    if (process.platform == "win32") {
        await sendWindowsKeys(normalizedKeys);
    } else if (process.platform == "darwin") {
        await sendMacKeys(normalizedKeys);
    }
}

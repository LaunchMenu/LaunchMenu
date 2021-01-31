import {exec} from "child_process";
import {promisify} from "util";
import Path from "path";
import {ISendKey} from "../_types/ISendKey";

/**
 * Sends the given key presses to the Windows OS
 * @param keys The keys to be send
 * @remarks This function currently doesn't support the meta modifier.
 */
export async function sendWindowsKeys(keys: ISendKey[]): Promise<void> {
    const codes = keys
        .map(
            ({key, modifiers}) =>
                `${modifiers
                    .map(
                        modifier =>
                            ({ctrl: "^", shift: "+", alt: "%", meta: ""}[modifier])
                    )
                    .join("")}{${key}}`
        )
        .join("");
    await promisify(exec)(
        `cscript.exe "${Path.join(__dirname, "sendWindowsKeys.vbs")}" "${codes}"`
    );
}

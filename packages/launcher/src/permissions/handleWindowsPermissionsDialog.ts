import regedit from "./regedit";
import {InstallerWindow} from "../installerWindow/InstallerWindow";
import {exec, ChildProcess} from "child_process";
import Path from "path";
import {app} from "electron";

/**
 * Manages the process of granting permissions for windows from the installer window
 * @param window The installer window to show the dialogs in
 */
export async function handleWindowsPermissionsDialog(
    window: InstallerWindow
): Promise<void> {
    let uacEnabled = await isUACPromptEnabled();

    if (uacEnabled) {
        let disableUAC = await window.setState({
            type: "prompt",
            text: "Your computer is set up to show User Access Control (UAC) prompts. This unfortunately currently interferes with LaunchMenu's auto startup feature. In order to make LaunchMenu startup automatically you will have to disable these notifications. This will unfortunately also make your computer slightly more vulnerable to malicious programs. Would you like to disable UAC prompts?",
            buttons: [
                {
                    text: "Disable prompts",
                    type: "primary",
                    value: true,
                },
                {
                    text: "Keep prompts",
                    type: "secondary",
                    value: false,
                },
            ],
        });

        if (!disableUAC) return;

        let message =
            "Please use the opened UI to change the settings to never notify you and then click the button below when finished.";
        while (uacEnabled && disableUAC) {
            let proc: ChildProcess | undefined;
            try {
                proc = exec("C:\\Windows\\System32\\UserAccountControlSettings.exe");
            } catch (e) {
                message =
                    "The UI couldn't be opened. Please google a guide for how to disable UAC prompts and disable them manually.";
            }

            disableUAC = await window.setState({
                type: "prompt",
                text: message,
                buttons: [
                    {
                        text: "Disabled",
                        type: "primary",
                        value: true,
                    },
                    {
                        text: "Cancel",
                        type: "secondary",
                        value: false,
                    },
                ],
            });
            uacEnabled = await isUACPromptEnabled();
            message =
                "It seems the setting weren't successfully changed, please try again and then click the button below.";

            if (proc) proc.kill();
        }
    }
}

/**
 * Check whether the permissions are set
 */
function isUACPromptEnabled(): Promise<boolean> {
    const vbsDirectory = Path.join(
        Path.dirname(app.getPath("exe")),
        "./resources/regedit/vbs"
    );
    regedit.setExternalVBSLocation(vbsDirectory);

    return new Promise((res, rej) => {
        const loc =
            "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System";
        regedit.list([loc], (err, value) => {
            if (err) rej(err);
            else {
                const entry = value[loc].values["ConsentPromptBehaviorAdmin"];
                res(entry?.value != 0);
            }
        });
    });
}

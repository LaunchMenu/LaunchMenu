import {systemPreferences} from "electron";
import {InstallerWindow} from "../installerWindow/InstallerWindow";

/**
 * Manages the process of granting permissions for mac from the installer window
 * @param window The installer window to show the dialogs in
 */
export async function handleMacPermissionsDialog(window: InstallerWindow): Promise<void> {
    let hasPermissions = systemPreferences.isTrustedAccessibilityClient(false);

    if (!hasPermissions) {
        let grant = await window.setState({
            type: "prompt",
            text: "LaunchMenu needs permissions in order for keyboard capturing to fully work. If you don't want to grant this permission, most functionality will still work but global key handling capabilities may be decreased.",
            buttons: [
                {
                    text: "Grant",
                    type: "primary",
                    value: true,
                },
                {
                    text: "Deny",
                    type: "secondary",
                    value: false,
                },
            ],
        });

        if (!grant) return;

        let message =
            "Please use the opened UI to grant the permissions, and then click the button below.";
        while (!hasPermissions && grant) {
            systemPreferences.isTrustedAccessibilityClient(true);
            grant = await window.setState({
                type: "prompt",
                text: message,
                buttons: [
                    {
                        text: "Granted",
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
            hasPermissions = systemPreferences.isTrustedAccessibilityClient(false);
            message =
                "It seems the permissions weren't successfully granted, please try again and then click the button below. If the box is already checked, you may need to uncheck and recheck it.";
        }
    }
}

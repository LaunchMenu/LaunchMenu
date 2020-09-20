import {ITextField} from "../../_types/ITextField";
import {removeText} from "../removeText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/fieldControlsSettingsFolder";

/**
 * Handles text removal inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param settings The keyboard settings
 * @returns Whether the event was caught
 */
export function handleRemovalInput(
    event: KeyEvent,
    textField: ITextField,
    settings: TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (settings.backspace.get().matches(event)) {
        removeText(textField, -1);
        return true;
    }
    if (settings.delete.get().matches(event)) {
        removeText(textField, 1);
        return true;
    }
}

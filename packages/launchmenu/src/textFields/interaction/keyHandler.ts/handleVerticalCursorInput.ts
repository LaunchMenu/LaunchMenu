import {ITextField} from "../../_types/ITextField";
import {moveCursorVertical} from "../moveCursorVertical";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/fieldControlsSettingsFolder";

/**
 * Handles vertical cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param settings The keyboard settings
 * @returns Whether the event was caught
 */
export function handleVerticalCursorInput(
    event: KeyEvent,
    textField: ITextField,
    settings: TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (settings.up.get().matches(event)) {
        moveCursorVertical(textField, -1, event.shift);
        return true;
    }
    if (settings.down.get().matches(event)) {
        moveCursorVertical(textField, 1, event.shift);
        return true;
    }
}

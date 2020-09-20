import {ITextField} from "../../_types/ITextField";
import {moveCursorHorizontal} from "../moveCursorHorizontal";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/fieldControlsSettingsFolder";

/**
 * Handles horizontal cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param settings The keyboard settings
 * @returns Whether the event was caught
 */
export function handleHorizontalCursorInput(
    event: KeyEvent,
    textField: ITextField,
    settings: TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (settings.left.get().matches(event)) {
        moveCursorHorizontal(textField, -1, event.shift);
        return true;
    }
    if (settings.right.get().matches(event)) {
        moveCursorHorizontal(textField, 1, event.shift);
        return true;
    }
}

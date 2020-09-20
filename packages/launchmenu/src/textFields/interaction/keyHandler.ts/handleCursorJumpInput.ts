import {ITextField} from "../../_types/ITextField";
import {jumpCursor} from "../jumpCursor";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/fieldControlsSettingsFolder";

/**
 * Handles cursor jump input (home/end)
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param settings The keyboard settings
 * @returns Whether the event was caught
 */
export function handleCursorJumpInput(
    event: KeyEvent,
    textField: ITextField,
    settings: TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (settings.end.get().matches(event)) {
        jumpCursor(textField, {dx: 1}, event.shift);
        return true;
    }
    if (settings.home.get().matches(event)) {
        jumpCursor(textField, {dx: -1}, event.shift);
        return true;
    }
    if (settings.selectAll.get().matches(event)) {
        jumpCursor(textField, {dx: -1});
        jumpCursor(textField, {dx: 1}, true);
        return true;
    }
}

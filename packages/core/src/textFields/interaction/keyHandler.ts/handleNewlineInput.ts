import {ITextField} from "../../_types/ITextField";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../menus/items/inputs/handlers/keyPattern/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";

/**
 * Handles new line inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param pattern The key pattern to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleNewlineInput(
    event: KeyEvent,
    textField: ITextField,
    pattern: KeyPattern | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(pattern)) pattern = pattern.insertLine.get();
    if (pattern.matches(event)) {
        insertText(textField, "\n");
        return true;
    }
}

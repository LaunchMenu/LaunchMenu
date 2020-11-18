import {ITextField} from "../../_types/ITextField";
import {removeText} from "../removeText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";

/**
 * Handles text removal inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleRemovalInput(
    event: KeyEvent,
    textField: ITextField,
    patterns:
        | {
              backspace: KeyPattern;
              delete: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            backspace: patterns.backspace.get(),
            delete: patterns.delete.get(),
        };

    if (patterns.backspace.matches(event)) {
        removeText(textField, -1);
        return true;
    }
    if (patterns.delete.matches(event)) {
        removeText(textField, 1);
        return true;
    }
}

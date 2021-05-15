import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {InsertTextCommand} from "../commands/InsertTextCommand";

/**
 * Handles new line inputs
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param pattern The key pattern to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleNewlineInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
    pattern: KeyPattern | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(pattern)) pattern = pattern.insertLine.get();
    if (pattern.matches(event)) {
        onChange(new InsertTextCommand(textField, "\n"));
        return true;
    }
}

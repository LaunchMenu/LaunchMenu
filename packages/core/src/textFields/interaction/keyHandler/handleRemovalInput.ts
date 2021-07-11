import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {RemoveTextCommand} from "../commands/RemoveTextCommand";
import {RemoveWordCommand} from "../commands/RemoveWordCommand";

/**
 * Handles text removal inputs
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleRemovalInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
    patterns:
        | {
              backspace: KeyPattern;
              delete: KeyPattern;
              backwardsDeleteWord: KeyPattern;
              forwardsDeleteWord: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            backspace: patterns.backspace.get(),
            delete: patterns.delete.get(),
            backwardsDeleteWord: patterns.backwardsDeleteWord.get(),
            forwardsDeleteWord: patterns.forwardsDeleteWord.get(),
        };

    if (patterns.backwardsDeleteWord.matches(event)) {
        onChange(new RemoveWordCommand(textField, -1));
        return true;
    }
    if (patterns.forwardsDeleteWord.matches(event)) {
        onChange(new RemoveWordCommand(textField, 1));
        return true;
    }
    if (patterns.backspace.matches(event)) {
        onChange(new RemoveTextCommand(textField, -1));
        return true;
    }
    if (patterns.delete.matches(event)) {
        onChange(new RemoveTextCommand(textField, 1));
        return true;
    }
}

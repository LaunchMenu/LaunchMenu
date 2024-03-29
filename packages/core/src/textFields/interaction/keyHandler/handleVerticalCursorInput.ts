import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {MoveCursorVerticalCommand} from "../commands/MoveCursorVerticalCommand";
import {ITextEditTarget} from "../_types/ITextEditTarget";

/**
 * Handles vertical cursor input
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleVerticalCursorInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
    patterns:
        | {
              up: KeyPattern;
              down: KeyPattern;
              expandSelection: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            up: patterns.up.get(),
            down: patterns.down.get(),
            expandSelection: patterns.expandSelection.get(),
        };

    const expand = patterns.expandSelection;
    if (patterns.up.matches(event)) {
        onChange(
            new MoveCursorVerticalCommand(textField, -1, expand.matchesModifier(event))
        );
        return true;
    }
    if (patterns.down.matches(event)) {
        onChange(
            new MoveCursorVerticalCommand(textField, 1, expand.matchesModifier(event))
        );
        return true;
    }
}

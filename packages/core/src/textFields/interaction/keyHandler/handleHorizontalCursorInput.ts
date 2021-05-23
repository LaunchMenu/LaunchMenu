import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {MoveCursorHorizontalCommand} from "../commands/MoveCursorHorizontalCommand";
import {ITextEditTarget} from "../_types/ITextEditTarget";

/**
 * Handles horizontal cursor input
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleHorizontalCursorInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
    patterns:
        | {
              left: KeyPattern;
              right: KeyPattern;
              expandSelection: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            left: patterns.left.get(),
            right: patterns.right.get(),
            expandSelection: patterns.expandSelection.get(),
        };

    const expand = patterns.expandSelection;
    if (patterns.left.matches(event)) {
        onChange(
            new MoveCursorHorizontalCommand(textField, -1, expand.matchesModifier(event))
        );
        return true;
    }
    if (patterns.right.matches(event)) {
        onChange(
            new MoveCursorHorizontalCommand(textField, 1, expand.matchesModifier(event))
        );
        return true;
    }
}

import {ITextField} from "../../_types/ITextField";
import {moveCursorHorizontal} from "../moveCursorHorizontal";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyPattern} from "../../../menus/items/inputs/handlers/keyPattern/KeyPattern";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";

/**
 * Handles horizontal cursor input
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleHorizontalCursorInput(
    event: KeyEvent,
    textField: ITextField,
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

    if (patterns.left.matches(event)) {
        moveCursorHorizontal(
            textField,
            -1,
            patterns.expandSelection.matchesModifier(event)
        );
        return true;
    }
    if (patterns.right.matches(event)) {
        moveCursorHorizontal(
            textField,
            1,
            patterns.expandSelection.matchesModifier(event)
        );
        return true;
    }
}

import {ITextField} from "../../_types/ITextField";
import {jumpCursor} from "../jumpCursor";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {moveCursorHorizontal} from "../moveCursorHorizontal";

/**
 * Handles cursor jump input (home/end)
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleCursorJumpInput(
    event: KeyEvent,
    textField: ITextField,
    patterns:
        | {
              end: KeyPattern;
              home: KeyPattern;
              selectAll: KeyPattern;
              jumpWordLeft: KeyPattern;
              jumpWordRight: KeyPattern;
              expandSelection: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns)) {
        const op = patterns;
        patterns = {
            get end() {
                return op.end.get();
            },
            get home() {
                return op.home.get();
            },
            get jumpWordLeft() {
                return op.jumpWordLeft.get();
            },
            get jumpWordRight() {
                return op.jumpWordRight.get();
            },
            get selectAll() {
                return op.selectAll.get();
            },
            get expandSelection() {
                return op.expandSelection.get();
            },
        };
    }

    if (patterns.jumpWordLeft.matches(event)) {
        moveCursorHorizontal(
            textField,
            -1,
            patterns.expandSelection.matchesModifier(event),
            true
        );
        return true;
    }
    if (patterns.jumpWordRight.matches(event)) {
        moveCursorHorizontal(
            textField,
            1,
            patterns.expandSelection.matchesModifier(event),
            true
        );
        return true;
    }

    if (patterns.end.matches(event)) {
        jumpCursor(textField, {dx: 1}, patterns.expandSelection.matchesModifier(event));
        return true;
    }
    if (patterns.home.matches(event)) {
        jumpCursor(textField, {dx: -1}, patterns.expandSelection.matchesModifier(event));
        return true;
    }
    if (patterns.selectAll.matches(event)) {
        jumpCursor(textField, {dx: -1, dy: -1});
        jumpCursor(textField, {dx: 1, dy: 1}, true);
        return true;
    }
}

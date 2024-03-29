import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {MoveCursorHorizontalCommand} from "../commands/MoveCursorHorizontalCommand";
import {JumpCursorCommand} from "../commands/JumpCursorCommand";
import {CompoundTextEditCommand} from "../commands/CompoundTextEditCommand";
import {ITextEditTarget} from "../_types/ITextEditTarget";

/**
 * Handles cursor jump input (home/end)
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleCursorJumpInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
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

    const expand = patterns.expandSelection;
    if (patterns.jumpWordLeft.matches(event)) {
        onChange(
            new MoveCursorHorizontalCommand(
                textField,
                -1,
                expand.matchesModifier(event),
                true
            )
        );
        return true;
    }
    if (patterns.jumpWordRight.matches(event)) {
        onChange(
            new MoveCursorHorizontalCommand(
                textField,
                1,
                expand.matchesModifier(event),
                true
            )
        );
        return true;
    }

    if (patterns.end.matches(event)) {
        onChange(
            new JumpCursorCommand(textField, {dx: 1}, expand.matchesModifier(event))
        );
        return true;
    }
    if (patterns.home.matches(event)) {
        onChange(
            new JumpCursorCommand(textField, {dx: -1}, expand.matchesModifier(event))
        );
        return true;
    }
    if (patterns.selectAll.matches(event)) {
        onChange(
            new CompoundTextEditCommand(
                [
                    new JumpCursorCommand(textField, {dx: -1, dy: -1}),
                    new JumpCursorCommand(textField, {dx: 1, dy: 1}, true),
                ],
                {name: "Select all"}
            )
        );
        return true;
    }
}

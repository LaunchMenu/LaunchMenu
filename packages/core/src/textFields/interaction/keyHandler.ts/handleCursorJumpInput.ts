import {ITextField} from "../../_types/ITextField";
import {jumpCursor} from "../jumpCursor";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {KeyPattern} from "../../../menus/items/inputs/handlers/keyPattern/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";

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
              expandSelection: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            end: patterns.end.get(),
            home: patterns.home.get(),
            selectAll: patterns.selectAll.get(),
            expandSelection: patterns.expandSelection.get(),
        };

    if (patterns.end.matches(event)) {
        jumpCursor(textField, {dx: 1}, patterns.expandSelection.matchesModifier(event));
        return true;
    }
    if (patterns.home.matches(event)) {
        jumpCursor(textField, {dx: -1}, patterns.expandSelection.matchesModifier(event));
        return true;
    }
    if (patterns.selectAll.matches(event)) {
        jumpCursor(textField, {dx: -1});
        jumpCursor(textField, {dx: 1}, true);
        return true;
    }
}

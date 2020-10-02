import {ITextField} from "../../_types/ITextField";
import {pasteText} from "../pasteText";
import {copyText} from "../copyText";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {KeyPattern} from "../../../menus/items/inputs/handlers/keyPattern/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleCopyPasteInput(
    event: KeyEvent,
    textField: ITextField,
    patterns:
        | {
              copy: KeyPattern;
              paste: KeyPattern;
              cut: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            copy: patterns.copy.get(),
            cut: patterns.cut.get(),
            paste: patterns.paste.get(),
        };

    if (patterns.copy.matches(event)) {
        copyText(textField);
        return true;
    }
    if (patterns.cut.matches(event)) {
        copyText(textField);
        insertText(textField, "");
        return true;
    }
    if (patterns.paste.matches(event)) {
        pasteText(textField);
        return true;
    }
}

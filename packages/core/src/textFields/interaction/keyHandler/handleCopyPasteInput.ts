import {pasteText} from "../pasteText";
import {copyText} from "../copyText";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {getEditTargetTextField} from "../performNormalizedTextEdit";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleCopyPasteInput(
    event: KeyEvent,
    targetField: ITextEditTarget,
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
        if (copyText(getEditTargetTextField(targetField))) return true;
    }
    if (patterns.cut.matches(event)) {
        if (copyText(getEditTargetTextField(targetField))) {
            insertText(targetField, "");
            return true;
        }
    }
    if (patterns.paste.matches(event)) {
        if (pasteText(targetField)) return true;
    }
}

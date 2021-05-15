import {copyText} from "../copyText";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {isFieldControlsSettingsFolder} from "./isFieldControlsSettingsFolder";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {InsertTextCommand} from "../commands/InsertTextCommand";
import {PasteTextCommand} from "../commands/PasteTextCommand";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export async function handleCopyPasteInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
    patterns:
        | {
              copy: KeyPattern;
              paste: KeyPattern;
              cut: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): Promise<void | boolean> {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            copy: patterns.copy.get(),
            cut: patterns.cut.get(),
            paste: patterns.paste.get(),
        };

    if (patterns.copy.matches(event)) {
        if (await copyText(textField)) return true;
    }
    if (patterns.cut.matches(event)) {
        if (copyText(textField)) {
            onChange(new InsertTextCommand(textField, ""));
            return true;
        }
    }
    if (patterns.paste.matches(event)) {
        const cmd = new PasteTextCommand(textField);
        onChange(cmd);
        if (await cmd.pasted) return true;
    }
}

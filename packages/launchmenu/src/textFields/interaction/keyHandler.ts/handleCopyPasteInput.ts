import {ITextField} from "../../_types/ITextField";
import {pasteText} from "../pasteText";
import {copyText} from "../copyText";
import {insertText} from "../insertText";
import {KeyEvent} from "../../../stacks/keyHandlerStack/KeyEvent";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {createFieldControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/fieldControlsSettingsFolder";

/**
 * Handles copying and pasting of text
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param settings The keyboard settings
 * @returns Whether the event was caught
 */
export function handleCopyPasteInput(
    event: KeyEvent,
    textField: ITextField,
    settings: TSettingsFromFactory<typeof createFieldControlsSettingsFolder>
): void | boolean {
    if (settings.copy.get().matches(event)) {
        copyText(textField);
        return true;
    }
    if (settings.cut.get().matches(event)) {
        copyText(textField);
        insertText(textField, "");
        return true;
    }
    if (settings.paste.get().matches(event)) {
        pasteText(textField);
        return true;
    }
}

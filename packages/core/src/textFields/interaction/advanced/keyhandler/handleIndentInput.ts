import {createFieldControlsSettingsFolder} from "../../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../../settings/_types/TSettingsFromFactory";
import {ITextField} from "../../../_types/ITextField";
import {insertText} from "../../insertText";
import {isFieldControlsSettingsFolder} from "../../keyHandler/isFieldControlsSettingsFolder";
import {indentText} from "../indentText";

/**
 * Handles tab inputs
 * @param event The event to test
 * @param textField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @param indentCharacters The characters to use for indentation
 * @returns Whether the event was caught
 */
export function handleIndentInput(
    event: KeyEvent,
    textField: ITextField,
    patterns:
        | {
              indent: KeyPattern;
              dedent: KeyPattern;
          }
        | TSettingsFromFactory<typeof createFieldControlsSettingsFolder>,
    indentCharacters: string = " ".repeat(4)
): void | boolean {
    if (isFieldControlsSettingsFolder(patterns))
        patterns = {
            indent: patterns.indent.get(),
            dedent: patterns.dedent.get(),
        };

    if (patterns.indent.matches(event)) {
        const selection = textField.getSelection();
        if (selection.start == selection.end) insertText(textField, indentCharacters);
        else indentText(textField, 1, indentCharacters);

        return true;
    }
    if (patterns.dedent.matches(event)) {
        indentText(textField, -1, indentCharacters);
        return true;
    }
}

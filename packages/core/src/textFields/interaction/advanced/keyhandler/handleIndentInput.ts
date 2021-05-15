import {createFieldControlsSettingsFolder} from "../../../../application/settings/baseSettings/controls/createFieldControlsSettingsFolder";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../../settings/_types/TSettingsFromFactory";
import {InsertTextCommand} from "../../commands/InsertTextCommand";
import {isFieldControlsSettingsFolder} from "../../keyHandler/isFieldControlsSettingsFolder";
import {ITextEditTarget} from "../../_types/ITextEditTarget";
import {IndentTextCommand} from "../IndentTextCommand";

/**
 * Handles tab inputs
 * @param event The event to test
 * @param targetField The text field to perform the event for
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @param indentCharacters The characters to use for indentation
 * @returns Whether the event was caught
 */
export function handleIndentInput(
    event: KeyEvent,
    {textField, onChange}: ITextEditTarget,
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
        if (selection.start == selection.end)
            onChange(new InsertTextCommand(textField, indentCharacters));
        else onChange(new IndentTextCommand(textField, 1, indentCharacters));

        return true;
    }
    if (patterns.dedent.matches(event)) {
        onChange(new IndentTextCommand(textField, -1, indentCharacters));
        return true;
    }
}

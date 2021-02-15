import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {TextEditCommand} from "./commands/TextEditCommand";
import {ITextAlterationInput} from "./commands/_types/ITextAlterationInput";
import {ITextEditTarget} from "./_types/ITextEditTarget";

/**
 * Performs a text edit using a normalized callback, either passing a command or performing the alteration immediately
 * @param target The target of the text change
 * @param edit The callback to perform the text change
 */
export function performNormalizedTextEdit(
    target: ITextEditTarget,
    edit: (
        textField: ITextField,
        undoable: boolean
    ) =>
        | TextEditCommand
        | {alterations: ITextAlterationInput[]; selection?: ITextSelection}
): void {
    const textField = "textField" in target ? target.textField : target;

    // Use the callback to retrieve the changes
    const result = edit(textField, "textField" in target);

    // Check the result and perform the necessary action
    if ("textField" in target) {
        // If a command was returned, simply return the command
        if (result instanceof TextEditCommand) target.onChange(result);
        // If alterations were returned, turn it into a command
        else {
            const command = new TextEditCommand(
                textField,
                result.alterations,
                result.selection
            );
            target.onChange(command);
        }
    } else {
        // If a command was returned, simply execute the command
        if (result instanceof TextEditCommand) result.execute();
        // If alterations were returned, combine them into the new text
        else {
            const {alterations, selection} = result;
            alterations.sort(({start: a}, {start: b}) => a - b);
            const newText = TextEditCommand.performAlterations(
                textField.get(),
                alterations
            );
            target.set(newText);
            if (selection) target.setSelection(selection);
        }
    }
}

/**
 * Retrieves the text field given a text edit target
 * @param targetField The text edit target
 * @returns The text field
 */
export const getEditTargetTextField = (targetField: ITextEditTarget): ITextField =>
    "textField" in targetField ? targetField.textField : targetField;
